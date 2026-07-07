<?php
namespace App\controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request; 
use Slim\routing\RouteCollectorProxy;
use App\controllers\Cliente;
use App\controllers\Mecanico;
use App\controllers\Admin;
use App\controllers\Oficinista;
use App\controllers\Vehiculo;
use App\controllers\Orden;
use App\controllers\Diagnostico;
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

    $api->group('/admin', function (RouteCollectorProxy $endpoint) {

        $endpoint->get('[/{id}]', Admin::class . ':read');
        $endpoint->post('', Admin::class . ':create');
        $endpoint->put('/{id}', Admin::class . ':update');
        $endpoint->delete('/{id}', Admin::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Admin::class . ':filter');//se pasan los parámetros de filtrado en la query string

    });

    $api->group('/oficinista', function (RouteCollectorProxy $endpoint) {

        $endpoint->get('[/{id}]', Oficinista::class . ':read');
        $endpoint->post('', Oficinista::class . ':create');
        $endpoint->put('/{id}', Oficinista::class . ':update');
        $endpoint->delete('/{id}', Oficinista::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Oficinista::class . ':filter');//se pasan los parámetros de filtrado en la query string

    });

    $api->group('/vehiculo', function (RouteCollectorProxy $endpoint) {

        $endpoint->get('[/{id}]', Vehiculo::class . ':read');
        $endpoint->post('', Vehiculo::class . ':create');
        $endpoint->put('/{id}', Vehiculo::class . ':update');
        $endpoint->delete('/{id}', Vehiculo::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Vehiculo::class . ':filter');//se pasan los parámetros de filtrado en la query string

    });

    $api->group('/orden', function (RouteCollectorProxy $endpoint) {

        $endpoint->get('[/{id}]', Orden::class . ':read');
        $endpoint->post('', Orden::class . ':create');
        $endpoint->put('/{id}', Orden::class . ':update');
        $endpoint->patch('/estado/{id}', Orden::class . ':cambiarEstado');
        $endpoint->delete('/{id}', Orden::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Orden::class . ':filter');//se pasan los parámetros de filtrado en la query string

    });

    $api->group('/diagnostico', function (RouteCollectorProxy $endpoint) {

        $endpoint->get('[/{id}]', Diagnostico::class . ':read');
        $endpoint->post('', Diagnostico::class . ':create');
        $endpoint->put('/{id}', Diagnostico::class . ':update');
        $endpoint->delete('/{id}', Diagnostico::class . ':delete');
        $endpoint->get('/filter/{pag}/{lim}', Diagnostico::class . ':filter');//se pasan los parámetros de filtrado en la query string

    });


    $api->group('/auth', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('', Auth::class . ':login');
        $endpoint->delete('/{id}', Auth::class . ':logout');
        $endpoint->patch('/refresh/{id}', Auth::class . ':refresh');
    });

    

    $api->group('/token', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('/modificar', Token::class . ':modificarToken');
        $endpoint->patch('/verificar', Token::class . ':verificarToken');
    });

    
     $api->group('/usuario', function(RouteCollectorProxy $endpoint) {
        $endpoint->patch('/passw/{id}', Usuario::class . ':changePassw');
        $endpoint->patch('/passw/reset/{id}', Usuario::class . ':resetPassw');
        $endpoint->patch('/rol/{id}', Usuario::class . ':changeRol');
        $endpoint->get('/{id}', Usuario::class . ':buscar');
    });
});