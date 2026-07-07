<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request;
 use Psr\Container\ContainerInterface;
 use pdo;

 class Admin {
    private $conteiner;
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }

public function read( Request $request, Response $response, array $args ){
    $sql = "SELECT * FROM Administradores ";

    if (isset($args['id'])) {
    $sql .= " WHERE id_administrador = :id ";

    }

    $sql .= "limit 0, 5";
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
        $sql = "INSERT INTO Administradores (cedula, nombre, email) VALUES (:cedula, :nombre, :email)";
        $con = $this->conteiner->get('conexion');
        $con->beginTransaction();
       try{

       $query = $con->prepare($sql);

        foreach ($body as $key => $value) {

        $tipo = gettype($value) === 'integer' ? PDO::PARAM_INT : PDO::PARAM_STR;
        $value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);
        $query->bindValue(":".$key, $value, $tipo);
        }

        $query->execute();

        // Insertar cuenta de usuario con rol 1
        $sql = "INSERT INTO Usuarios (cedula, passw, rol) VALUES (:cedula, :passw, :rol)";
        $passw = password_hash($body->cedula, PASSWORD_BCRYPT, ['cost' => 10]);
        $rol = 1; // rol para administradores según Roles enum del frontend
        $query = $con->prepare($sql);
        $query->bindValue(':cedula', $body->cedula, PDO::PARAM_STR);
        $query->bindValue(':passw', $passw, PDO::PARAM_STR);
        $query->bindValue(':rol', $rol, PDO::PARAM_INT);

        $query->execute();
        $con->commit();
        $status = 201;
       }

       catch(\PDOException $e){
        $status = match ($e->getCode()) {
         23000 => 409,
         "42S02" => 501,
         default => 500,
       };
        $con->rollBack();
        $query = null;
        $con = null;
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

        // obtener cedula actual para sincronizar Usuarios si cambia
        $q = $con->prepare("SELECT cedula FROM Administradores WHERE id_administrador = :id");
        $q->execute(['id' => $id]);
        $current = $q->fetch();
        $oldCedula = $current ? $current->cedula : null;

       $sql = "UPDATE Administradores SET cedula = :cedula, nombre = :nombre, email = :email WHERE id_administrador = :id";
       $query = $con->prepare($sql);

        foreach ($body as $key => $value) {

        $tipo = gettype($value) === 'integer' ? PDO::PARAM_INT : PDO::PARAM_STR;
        $value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);
        $query->bindValue(":".$key, $value, $tipo);
        }

        $query->bindValue(':id', $id, PDO::PARAM_INT);
        $query->execute();

        // Si cambió la cédula, actualizar la tabla Usuarios
        if ($oldCedula && isset($body->cedula) && $body->cedula !== $oldCedula) {
            $qu = $con->prepare("UPDATE Usuarios SET cedula = :new WHERE cedula = :old");
            $qu->execute(['new' => $body->cedula, 'old' => $oldCedula]);
        }

        $con->commit();
        $status = 200;
       }
       catch(\PDOException $e){
       $status = match ($e->getCode()) {
         23000 => 409,
         "42S02" => 501,
         default => 500,
       };
        $con->rollBack();
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
        $con->beginTransaction();
        try{
            $q = $con->prepare("SELECT cedula FROM Administradores WHERE id_administrador = :id");
            $q->execute(['id' => $id]);
            $row = $q->fetch();
            $cedula = $row ? $row->cedula : null;

            $query = $con->prepare("DELETE FROM Administradores WHERE id_administrador = :id");
            $query ->execute(['id' => $id]);

            if ($cedula) {
                $qu = $con->prepare("DELETE FROM Usuarios WHERE cedula = :cedula");
                $qu->execute(['cedula' => $cedula]);
            }

            $con->commit();
            $status = $query->rowCount() > 0 ? 200 : 404;
        }catch(\PDOException $e){
            $con->rollBack();
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

        $sql = "SELECT *, COUNT(*) OVER() as total FROM Administradores WHERE 1=1";
        $params = [];

        if (isset($datos['cedula']) && $datos['cedula'] !== '') {
            $sql .= " AND cedula LIKE :cedula";
            $params[':cedula'] = '%' . filter_var($datos['cedula'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        if (isset($datos['nombre']) && $datos['nombre'] !== '') {
            $sql .= " AND nombre LIKE :nombre";
            $params[':nombre'] = '%' . filter_var($datos['nombre'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
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
