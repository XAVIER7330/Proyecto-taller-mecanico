<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 
 use Psr\Container\ContainerInterface;
 use pdo;

 class Mecanico {
    private $conteiner;
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }
    
public function read( Request $request, Response $response, array $args ){
    $sql = "SELECT * FROM Mecanicos ";


    if (isset($args['id'])) {
    $sql .= " WHERE id_mecanico = :id ";
       
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
        $sql = "INSERT INTO Mecanicos (cedula, nombre, especialidad) VALUES (:cedula, :nombre, :especialidad)";
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

        // Insertar cuenta de usuario con rol 2
        $sql = "INSERT INTO Usuarios (cedula, passw, rol) VALUES (:cedula, :passw, :rol)";
        $passw = password_hash($body->cedula, PASSWORD_BCRYPT, ['cost' => 10]);
        $rol = 2; // rol para mecánicos según requerimiento
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
        $q = $con->prepare("SELECT cedula FROM Mecanicos WHERE id_mecanico = :id");
        $q->execute(['id' => $id]);
        $current = $q->fetch();
        $oldCedula = $current ? $current->cedula : null;

       $sql = "UPDATE Mecanicos SET cedula = :cedula, nombre = :nombre, especialidad = :especialidad WHERE id_mecanico = :id";
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
            $q = $con->prepare("SELECT cedula FROM Mecanicos WHERE id_mecanico = :id");
            $q->execute(['id' => $id]);
            $row = $q->fetch();
            $cedula = $row ? $row->cedula : null;

            $query = $con->prepare("DELETE FROM Mecanicos WHERE id_mecanico = :id");
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

        $sql = "SELECT * FROM Mecanicos WHERE 1=1";
        $params = [];

        if (isset($datos['cedula']) && $datos['cedula'] !== '') {
            $sql .= " AND cedula LIKE :cedula";
            $params[':cedula'] = '%' . filter_var($datos['cedula'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        if (isset($datos['nombre']) && $datos['nombre'] !== '') {
            $sql .= " AND nombre LIKE :nombre";
            $params[':nombre'] = '%' . filter_var($datos['nombre'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
        }

        if (isset($datos['especialidad']) && $datos['especialidad'] !== '') {
            $sql .= " AND especialidad LIKE :especialidad";
            $params[':especialidad'] = '%' . filter_var($datos['especialidad'], FILTER_SANITIZE_SPECIAL_CHARS) . '%';
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
            $res = $query->fetchAll();

            $status = $query->rowCount() > 0 ? 200 : 204;

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
