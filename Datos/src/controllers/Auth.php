<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 
 use Psr\Container\ContainerInterface;
 use pdo;

 class Auth extends Autenticar {
    function login(request $request, response $response, array $args){
        $body = json_decode($request->getBody());

        if($datos =$this->autenticar($body->cedula, $body->passw)){
            $retorno = array_merge(["cedula"=>$body->cedula],$datos);
            $status = 200;
        } else {
            $retorno = ["error" => "Credenciales inválidas"];
            $status = 401;
        }
        $response->getBody()->write(json_encode($retorno));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);
            
    }


    function logout(request $request, response $response, array $args){
        $this->revocarToken($args["id"]);
        $response->getBody()->write(json_encode(["message" => "Token revocado"]));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);
    }


    }