<?php
//use slim\Factory\AppFactory;




use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable("/var/www/html");
$dotenv->load();



$container = new Container();
AppFactory::setContainer($container);
$app = AppFactory::create();

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/routes.php';
require_once __DIR__ . '/conexion.php';

$app->run();
