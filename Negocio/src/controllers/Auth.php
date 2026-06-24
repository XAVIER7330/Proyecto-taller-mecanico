<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 

 

 class Auth extends servicioCurl {
    use Token, Autenticar;

    const ENDPOINT = '/auth';


    public function login(request $request, response $response, $args){
        $body = json_decode($request->getBody());
        $datos = $this->autenticar($body->cedula, $body->passw);

        if($datos){
            $nombre = $datos->nombre ?? '';
            $tokens = $this->generarToken($datos->cedula, $datos->rol, $nombre);
            $this->modificarToken(cedula: $datos->cedula, tkRef: $tokens["tkRef"]);
           

            } else {
                $tokens = [
                    "error" => "Credenciales invalidas"
                ];
            // Handle login failure
        }

        $response->getBody()->write(json_encode($tokens));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($datos ? 200 : 401);
    }

    public function logout(request $request, response $response, $args){
       $resp = $this->modificarToken(cedula: $args["id"]);

        return $response->withStatus($resp ? 200 : 401);
    }

    public function refresh(request $request, response $response, $args){
        $body = json_decode($request->getBody());
        $datos = $this->verificarToken($args["id"], $body->tkRef);
        $body = json_decode($datos["body"]);
        $status = json_decode($datos["status"]);

        if($status == 200){
            $tokens = $this->generarToken($args["id"], $body->rol);
            $this->modificarToken(cedula: $args["id"], tkRef: $tokens["tkRef"]);

            $response->getBody()->write(json_encode($tokens));
            }
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);
 }
 }