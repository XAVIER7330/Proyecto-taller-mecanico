<?php
namespace App\controllers;
 use Psr\Http\Message\ResponseInterface as Response;
 use Psr\Http\Message\ServerRequestInterface as Request; 
 use Psr\Container\ContainerInterface;
 use pdo;

 class Cliente extends ServicioCurl {
    private $conteiner;
    Private const ENDPOINT = "/cliente";
    public function __construct(ContainerInterface $c){
    $this->conteiner = $c;
    }
    
public function read( Request $request, Response $response, array $args ){
$url = self::ENDPOINT;
if(isset($args['id'])){
    $url .= "/".$args['id'];
}


$resp = $this->ejecutar($url, 'GET');
$status = $resp['status'];
$resp = $resp['body'];

        $response->getBody()->write($resp);
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);


}

public function create( Request $request, Response $response, array $args ){
    
        $body = json_decode($request->getBody());

        $resp = $this->ejecutar(self::ENDPOINT, 'POST', json_encode($body));
        $status = $resp['status'];
        $resp = $resp['body'];



        $response->getBody()->write($resp);
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);

}

public function update( Request $request, Response $response, array $args ){
    
        $body = json_decode($request->getBody());
        $id_cliente = $args['id'];
        $uri = self::ENDPOINT."/".$id_cliente;
       

        $resp = $this->ejecutar($uri, 'PUT', json_encode($body));
        $status = $resp['status'];
        $resp = $resp['body'];



        $response->getBody()->write($resp);
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);

}

 public function delete(Request $request, Response $response, array $args){

        $id_cliente = $args['id'];
        $uri = self::ENDPOINT."/".$id_cliente;
       
        $resp = $this->ejecutar($uri, 'DELETE');
        $status = $resp['status'];
        $resp = $resp['body'];



        $response->getBody()->write($resp);
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);

            
    }

    public function filter(Request $request, Response $response, array $args){
       
    $datos = http_build_query($request->getQueryParams());
    $uri = self::ENDPOINT . "/filter/" . $args['pag'] . "/" . $args['lim'];
    if (!empty($datos)) {
        $uri .= "?" . $datos;
    }

    $resp = $this->ejecutar( $uri, 'GET');

        $status = $resp['status'];
        $resp = $resp['body'];



        $response->getBody()->write($resp);
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus($status);
    }

 }

