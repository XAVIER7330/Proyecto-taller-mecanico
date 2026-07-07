<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request;
 use Psr\Container\ContainerInterface;
 use pdo;

 class Orden {
    private $conteiner;
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }

    private const SELECT_COLS = "SELECT o.*, v.placa, cl.cedula AS cedula_cliente, cl.nombre AS nombre_cliente,
            m.cedula AS cedula, m.nombre AS nombre_mecanico,
            d.id_diagnostico, d.descripcion, d.observaciones";
    private const FROM_JOINS = " FROM OrdenesReparacion o
        LEFT JOIN Vehiculos v ON o.id_vehiculo = v.id_vehiculo
        LEFT JOIN Clientes cl ON v.id_cliente = cl.id_cliente
        LEFT JOIN Mecanicos m ON o.id_mecanico = m.id_mecanico
        LEFT JOIN Diagnosticos d ON d.id_orden = o.id_orden";

    private function buscarVehiculoPorPlaca($con, $placa){
        $q = $con->prepare("SELECT id_vehiculo FROM Vehiculos WHERE placa = :placa");
        $q->execute(['placa' => $placa]);
        $vehiculo = $q->fetch();
        return $vehiculo ? $vehiculo->id_vehiculo : null;
    }

    private function buscarMecanicoPorCedula($con, $cedula){
        $q = $con->prepare("SELECT id_mecanico FROM Mecanicos WHERE cedula = :cedula");
        $q->execute(['cedula' => $cedula]);
        $mecanico = $q->fetch();
        return $mecanico ? $mecanico->id_mecanico : null;
    }

    private const ESTADOS_VALIDOS = [
        'INGRESADO', 'EN_DIAGNOSTICO', 'ESPERANDO_APROBACION', 'EN_REPARACION', 'LISTO_PARA_ENTREGA', 'ENTREGADO'
    ];

public function read( Request $request, Response $response, array $args ){
    $sql = self::SELECT_COLS . self::FROM_JOINS;

    if (isset($args['id'])) {
    $sql .= " WHERE o.id_orden = :id ";

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

        $id_vehiculo = $this->buscarVehiculoPorPlaca($con, $body->placa ?? '');
        if (!$id_vehiculo) {
            $response->getBody()->write(json_encode(['error' => 'Vehículo no encontrado']));
            $con = null;
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(404);
        }

        $id_mecanico = null;
        if (!empty($body->cedula)) {
            $id_mecanico = $this->buscarMecanicoPorCedula($con, $body->cedula);
            if (!$id_mecanico) {
                $response->getBody()->write(json_encode(['error' => 'Mecánico no encontrado']));
                $con = null;
                return $response
                    ->withHeader('content-type', 'application/json')
                    ->withStatus(404);
            }
        }

       try{

        // fecha_entrada, estado y costo_total usan sus valores por defecto (INGRESADO, 0.00, ahora)
        $sql = "INSERT INTO OrdenesReparacion (id_vehiculo, id_mecanico) VALUES (:id_vehiculo, :id_mecanico)";
        $query = $con->prepare($sql);
        $query->bindValue(':id_vehiculo', $id_vehiculo, PDO::PARAM_INT);
        $query->bindValue(':id_mecanico', $id_mecanico, $id_mecanico === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
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

        $id_vehiculo = $this->buscarVehiculoPorPlaca($con, $body->placa ?? '');
        if (!$id_vehiculo) {
            $response->getBody()->write(json_encode(['error' => 'Vehículo no encontrado']));
            $con = null;
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(404);
        }

        $id_mecanico = null;
        if (!empty($body->cedula)) {
            $id_mecanico = $this->buscarMecanicoPorCedula($con, $body->cedula);
            if (!$id_mecanico) {
                $response->getBody()->write(json_encode(['error' => 'Mecánico no encontrado']));
                $con = null;
                return $response
                    ->withHeader('content-type', 'application/json')
                    ->withStatus(404);
            }
        }

       try{

        // El estado no se modifica aquí: cambia únicamente a través del flujo de diagnóstico/aprobación
        $sql = "UPDATE OrdenesReparacion SET id_vehiculo = :id_vehiculo, id_mecanico = :id_mecanico WHERE id_orden = :id";
        $query = $con->prepare($sql);
        $query->bindValue(':id_vehiculo', $id_vehiculo, PDO::PARAM_INT);
        $query->bindValue(':id_mecanico', $id_mecanico, $id_mecanico === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
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

public function cambiarEstado(Request $request, Response $response, array $args){

        $id = $args['id'];
        $body = json_decode($request->getBody());
        $estado = $body->estado ?? null;

        if (!in_array($estado, self::ESTADOS_VALIDOS, true)) {
            $response->getBody()->write(json_encode(['error' => 'Estado no válido']));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(422);
        }

        $con = $this->conteiner->get('conexion');

        $q = $con->prepare("SELECT id_orden FROM OrdenesReparacion WHERE id_orden = :id");
        $q->execute(['id' => $id]);
        if (!$q->fetch()) {
            $con = null;
            $response->getBody()->write(json_encode(['error' => 'Orden no encontrada']));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(404);
        }

        try{
            $query = $con->prepare("UPDATE OrdenesReparacion SET estado = :estado WHERE id_orden = :id");
            $query->bindValue(':estado', $estado, PDO::PARAM_STR);
            $query->bindValue(':id', $id, PDO::PARAM_INT);
            $query->execute();
            $status = 200;
            $resultado = ['estado' => $estado];
        }catch(\PDOException $e){
            $status = 500;
            $resultado = ['error' => $e->getMessage()];
        }

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($resultado));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);
    }

 public function delete(Request $request, Response $response, array $args){

        $id = $args['id'];

        $con = $this->conteiner->get('conexion');
        try{
            $query = $con->prepare("DELETE FROM OrdenesReparacion WHERE id_orden = :id");
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

        if (isset($datos['placa']) && $datos['placa'] !== '') {
            $sql .= " AND v.placa LIKE :placa";
            $params[':placa'] = '%' . filter_var($datos['placa'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        if (isset($datos['estado']) && $datos['estado'] !== '') {
            $sql .= " AND o.estado = :estado";
            $params[':estado'] = filter_var($datos['estado'], FILTER_SANITIZE_SPECIAL_CHARS);
        }

        $sql .= " ORDER BY o.id_orden DESC LIMIT :offset, :lim";

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
