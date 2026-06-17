<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 
 use Psr\Container\ContainerInterface;
 use pdo;

 class Autenticar {
    protected $container;
    public function __construct(ContainerInterface $c){
    $this->container = $c;
    }

    protected function autenticar($idUsuario, $pass){
        $sql = "SELECT * FROM Usuarios WHERE cedula = :idUsuario";
        $con = $this->container->get('conexion');
        $query = $con->prepare($sql);
        $query->bindValue(':idUsuario', $idUsuario, PDO::PARAM_STR);
        $query->execute();
        $datos = $query->fetch();

        if ($datos && password_verify($pass, $datos->passw)) {
           $recurso = match ($datos->rol) {
                1 => 'administradores',
                2 => 'oficinas',
                3 => 'mecanicos',
                4 => 'clientes',
                };

                $sql = "SELECT * FROM $recurso WHERE cedula = :idUsuario";

                $query = $con->prepare($sql);
                $query->bindValue(':idUsuario', $datos->cedula, PDO::PARAM_STR);
                $query->execute();

                $rol = $datos->rol;
                $datos = $query->fetch();
                $retorno = [
                    
                    'nombre' => $datos->nombre,
                    'rol' => $rol];

        }
        $query = null;
        $con = null;
        return isset($retorno) ? $retorno : false;
        }
 }