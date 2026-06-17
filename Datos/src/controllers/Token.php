<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 
 use Psr\Container\ContainerInterface;
 use pdo;

    class Token {
    public function __construct(protected ContainerInterface $conteiner){}


   public function modificarToken( Request $request, Response $response, array $args ){
    $body = json_decode($request->getBody());
    $sql = "UPDATE Usuarios SET tkRef = :tkRef ";

    if($body->tkRef != ""){
    $sql .= ", ultimo_acceso = now() ";
    }

    $sql .= "WHERE cedula = :cedula";

     $con = $this->conteiner->get('conexion');
        $query = $con->prepare($sql);
        $query->bindValue(':tkRef', $body->tkRef, PDO::PARAM_STR);
        $query->bindValue(':cedula', $body->cedula, PDO::PARAM_STR);
        $query->execute();
        $datos = $query->rowCount();
        $query = null;
        $con = null;
           if($datos > 0){
                $response->getBody()->write(json_encode(['message' => 'Token actualizado correctamente']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            } else {
                $response->getBody()->write(json_encode(['message' => 'Error al actualizar el token']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(500);   

        }  } }