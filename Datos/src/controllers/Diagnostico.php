<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request;
 use Psr\Container\ContainerInterface;
 use pdo;

 class Diagnostico {
    private $conteiner;
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }

    private const SELECT_COLS = "SELECT d.*, o.estado, o.id_vehiculo, v.placa";
    private const FROM_JOINS = " FROM Diagnosticos d
        INNER JOIN OrdenesReparacion o ON d.id_orden = o.id_orden
        LEFT JOIN Vehiculos v ON o.id_vehiculo = v.id_vehiculo";

public function read( Request $request, Response $response, array $args ){
    $sql = self::SELECT_COLS . self::FROM_JOINS;

    if (isset($args['id'])) {
    $sql .= " WHERE d.id_diagnostico = :id ";

    }

    $con = $this->conteiner->get('conexion');

    $query = $con->prepare($sql);
    if (isset($args['id'])) {
        $query->execute(['id' => $args['id']]);
    } else {
        $query->execute();
        }


        $res = $query->fetchAll();

        $status = $query->rowCount() > 0 ? 200 : 204;
        $query = null;
        $con = null;


        $response->getBody()->write(json_encode($res));


        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);
}

public function create( Request $request, Response $response, array $args ){

        $body = json_decode($request->getBody());
        $con = $this->conteiner->get('conexion');
        $con->beginTransaction();
       try{

        $sql = "INSERT INTO Diagnosticos (id_orden, descripcion, observaciones, presupuesto_estimado) VALUES (:id_orden, :descripcion, :observaciones, :presupuesto_estimado)";
        $query = $con->prepare($sql);
        $query->bindValue(':id_orden', (int)$body->id_orden, PDO::PARAM_INT);
        $query->bindValue(':descripcion', filter_var($body->descripcion, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':observaciones', filter_var($body->observaciones ?? '', FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':presupuesto_estimado', (float)$body->presupuesto_estimado, PDO::PARAM_STR);
        $query->execute();

        // El diagnóstico y presupuesto quedan listos: la orden pasa a la espera de aprobación del cliente
        $sql = "UPDATE OrdenesReparacion SET estado = 'ESPERANDO_APROBACION', costo_total = :costo_total WHERE id_orden = :id_orden";
        $query = $con->prepare($sql);
        $query->bindValue(':costo_total', (float)$body->presupuesto_estimado, PDO::PARAM_STR);
        $query->bindValue(':id_orden', (int)$body->id_orden, PDO::PARAM_INT);
        $query->execute();

        $con->commit();
        $status = 201;
       }

       catch(\PDOException $e){
        $con->rollBack();
        $status = match ($e->getCode()) {
         23000 => 409,
         "42S02" => 501,
         default => 500,
       };
       $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
       }

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($body));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);

}

public function update( Request $request, Response $response, array $args ){

        $body = json_decode($request->getBody());
        $id = $args['id'];
        $con = $this->conteiner->get('conexion');
        $con->beginTransaction();
       try{

        $sql = "UPDATE Diagnosticos SET descripcion = :descripcion, observaciones = :observaciones, presupuesto_estimado = :presupuesto_estimado WHERE id_diagnostico = :id";
        $query = $con->prepare($sql);
        $query->bindValue(':descripcion', filter_var($body->descripcion, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':observaciones', filter_var($body->observaciones ?? '', FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':presupuesto_estimado', (float)$body->presupuesto_estimado, PDO::PARAM_STR);
        $query->bindValue(':id', $id, PDO::PARAM_INT);
        $query->execute();

        // Mantener sincronizado el costo_total de la orden con el presupuesto revisado
        $sql = "UPDATE OrdenesReparacion o INNER JOIN Diagnosticos d ON d.id_orden = o.id_orden
                SET o.costo_total = :costo_total WHERE d.id_diagnostico = :id";
        $query = $con->prepare($sql);
        $query->bindValue(':costo_total', (float)$body->presupuesto_estimado, PDO::PARAM_STR);
        $query->bindValue(':id', $id, PDO::PARAM_INT);
        $query->execute();

        $con->commit();
        $status = 200;
       }
       catch(\PDOException $e){
        $con->rollBack();
       $status = match ($e->getCode()) {
         23000 => 409,
         "42S02" => 501,
         default => 500,
       };
       $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
       }

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($body));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);

}

 public function delete(Request $request, Response $response, array $args){

        $id = $args['id'];

        $con = $this->conteiner->get('conexion');
        try{
            $query = $con->prepare("DELETE FROM Diagnosticos WHERE id_diagnostico = :id");
            $query ->execute(['id' => $id]);
            $status = $query->rowCount() > 0 ? 200 : 404;
        }catch(\PDOException $e){
            $status = 500;
            $response->getBody()->write(json_encode(['msg' => $e->getMessage()]));
        };
            $query = null;
            $con = null;

            return $response ->withStatus($status);
    }


public function filter(Request $request, Response $response, array $args){

        $datos = $request->getQueryParams();
        $pag = isset($args['pag']) ? (int)$args['pag'] : 1;
        $lim = isset($args['lim']) ? (int)$args['lim'] : 5;
        $pag = $pag > 0 ? $pag : 1;
        $lim = $lim > 0 ? $lim : 5;
        $offset = ($pag - 1) * $lim;

        $sql = self::SELECT_COLS . ", COUNT(*) OVER() as total" . self::FROM_JOINS . " WHERE 1=1";
        $params = [];

        if (isset($datos['id_orden']) && $datos['id_orden'] !== '') {
            $sql .= " AND d.id_orden = :id_orden";
            $params[':id_orden'] = (int)$datos['id_orden'];
        }

        if (isset($datos['placa']) && $datos['placa'] !== '') {
            $sql .= " AND v.placa LIKE :placa";
            $params[':placa'] = '%' . filter_var($datos['placa'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        $sql .= " LIMIT :offset, :lim";

        $con = $this->conteiner->get('conexion');
        try{
            $query = $con->prepare($sql);

            foreach ($params as $key => $value) {
                $tipo = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $query->bindValue($key, $value, $tipo);
            }

            $query->bindValue(':offset', $offset, PDO::PARAM_INT);
            $query->bindValue(':lim', $lim, PDO::PARAM_INT);

            $query->execute();
            $data = $query->fetchAll();

            $total = $data[0]->total ?? 0;
            $data = array_map(function($item) {
                unset($item->total);
                return $item;
            }, $data);

            $res['data'] = $data;
            $res['totalRegistros'] = $total;

            $status = $total > 0 ? 200 : 204;

        }catch(\PDOException $e){
            $status = 500;
            $res = ['msg' => "Se produjo un error al procesar la solicitud."];
       }
        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($res));
        return $response
            ->withHeader('Content-Type','Application/json')
            ->withStatus($status);
    }

 }
