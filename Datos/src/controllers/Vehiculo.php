<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request;
 use Psr\Container\ContainerInterface;
 use pdo;

 class Vehiculo {
    private $conteiner;
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }

    private function buscarClientePorCedula($con, $cedula){
        $q = $con->prepare("SELECT id_cliente FROM Clientes WHERE cedula = :cedula");
        $q->execute(['cedula' => $cedula]);
        $cliente = $q->fetch();
        return $cliente ? $cliente->id_cliente : null;
    }

public function read( Request $request, Response $response, array $args ){
    $sql = "SELECT v.*, c.cedula AS cedula, c.nombre AS nombre_cliente
            FROM Vehiculos v INNER JOIN Clientes c ON v.id_cliente = c.id_cliente";

    if (isset($args['id'])) {
    $sql .= " WHERE v.id_vehiculo = :id ";

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

        $id_cliente = $this->buscarClientePorCedula($con, $body->cedula ?? '');
        if (!$id_cliente) {
            $response->getBody()->write(json_encode(['error' => 'Cliente no encontrado']));
            $con = null;
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(404);
        }

       try{

        $sql = "INSERT INTO Vehiculos (placa, marca, modelo, anio, id_cliente) VALUES (:placa, :marca, :modelo, :anio, :id_cliente)";
        $query = $con->prepare($sql);
        $query->bindValue(':placa', filter_var($body->placa, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':marca', filter_var($body->marca, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':modelo', filter_var($body->modelo, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':anio', (int)$body->anio, PDO::PARAM_INT);
        $query->bindValue(':id_cliente', $id_cliente, PDO::PARAM_INT);
        $query->execute();

        $status = 201;
       }

       catch(\PDOException $e){
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

        $id_cliente = $this->buscarClientePorCedula($con, $body->cedula ?? '');
        if (!$id_cliente) {
            $response->getBody()->write(json_encode(['error' => 'Cliente no encontrado']));
            $con = null;
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(404);
        }

       try{

       $sql = "UPDATE Vehiculos SET placa = :placa, marca = :marca, modelo = :modelo, anio = :anio, id_cliente = :id_cliente WHERE id_vehiculo = :id";
       $query = $con->prepare($sql);
        $query->bindValue(':placa', filter_var($body->placa, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':marca', filter_var($body->marca, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':modelo', filter_var($body->modelo, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':anio', (int)$body->anio, PDO::PARAM_INT);
        $query->bindValue(':id_cliente', $id_cliente, PDO::PARAM_INT);
        $query->bindValue(':id', $id, PDO::PARAM_INT);
        $query->execute();

        $status = 200;
       }
       catch(\PDOException $e){
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
            $query = $con->prepare("DELETE FROM Vehiculos WHERE id_vehiculo = :id");
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

        $sql = "SELECT v.*, c.cedula AS cedula, c.nombre AS nombre_cliente, COUNT(*) OVER() as total
                FROM Vehiculos v INNER JOIN Clientes c ON v.id_cliente = c.id_cliente WHERE 1=1";
        $params = [];

        if (isset($datos['placa']) && $datos['placa'] !== '') {
            $sql .= " AND v.placa LIKE :placa";
            $params[':placa'] = '%' . filter_var($datos['placa'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        if (isset($datos['cedula']) && $datos['cedula'] !== '') {
            $sql .= " AND c.cedula LIKE :cedula";
            $params[':cedula'] = '%' . filter_var($datos['cedula'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        $sql .= " LIMIT :offset, :lim";

        $con = $this->conteiner->get('conexion');
        try{
            $query = $con->prepare($sql);

            foreach ($params as $key => $value) {
                $query->bindValue($key, $value, PDO::PARAM_STR);
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
