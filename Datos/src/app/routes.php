<?php
namespace App\controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request; 
use Slim\routing\RouteCollectorProxy;
use App\controllers\Cliente;
use App\controllers\Auth;
use App\controllers\Token;
use App\controllers\Usuario;


  
$app->get('/hello/{name}', function (Request $request, Response $response, array $args) {
    $name = $args['name'];
    $response->getBody()->write("Hello, $name");
    return $response;
}); 
$app->group('/api', function (RouteCollectorProxy $api) {

    $api->group('/cliente', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('[/{id}]', Cliente::class . ':read');
        $endpoint->post('', Cliente::class . ':create');
        $endpoint->put('/{id}', Cliente::class . ':update');
        $endpoint->delete('/{id}', Cliente::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Cliente::class . ':filter');//se pasan los parámetros de filtrado en la query string
    });
    
    $api->group('/mecanico', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('[/{id}]', Mecanico::class . ':read');
        $endpoint->post('', Mecanico::class . ':create');
        $endpoint->put('/{id}', Mecanico::class . ':update');
        $endpoint->delete('/{id}', Mecanico::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Mecanico::class . ':filter');//se pasan los parámetros de filtrado en la query string
    });


    $api->group('/auth', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('', Auth::class . ':login');
        $endpoint->delete('/{id}', Auth::class . ':logout');
      
    });

    $api->group('/token', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('/modificar', Token::class . ':modificarToken');
        $endpoint->patch('/verificar/{id}', Token::class . ':verificarToken');
    });

     
     $api->group('/usuario', function(RouteCollectorProxy $endpoint) {
        $endpoint->patch('/passw/{id}', Usuario::class . ':changePassw');
        $endpoint->patch('/passw/reset/{id}', Usuario::class . ':resetPassw');
        $endpoint->patch('/rol/{id}', Usuario::class . ':changeRol');
        $endpoint->get('/{id}', Usuario::class . ':buscar');
    });
});