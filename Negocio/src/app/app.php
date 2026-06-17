<?php
//use slim\Factory\AppFactory;



use Slim\Factory\AppFactory;
use JimTools\JwtAuth\Middleware\JwtAuthentication;
use JimTools\JwtAuth\Options;
use JimTools\JwtAuth\Decoder\FirebaseDecoder;
use JimTools\JwtAuth\Secret;
use JimTools\JwtAuth\Rules\RequestMethodRule;
use JimTools\JwtAuth\Rules\RequestPathRule;
use JimTools\JwtAuth\Exceptions\AuthorizationException;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable("/var/www/html");
$dotenv->load();



$container = new Container();
AppFactory::setContainer($container);
$app = AppFactory::create();

$rules = [
    new RequestMethodRule(ignore: ['OPTIONS']),
    new RequestPathRule(paths: ["/api"], ignore: ["/api/","/api/auth"])
];

$decoder = new FirebaseDecoder(new Secret($_ENV['KEY'], 'HS256'));
$authentication = new JwtAuthentication(new Options, $decoder, $rules, ["secure" => false]);

$app->addMiddleware($authentication);

$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setErrorHandler(AuthorizationException::class, function ($request, $exception, $displayErrorDetails) use ($app) {
    $response = $app->getResponseFactory()->createResponse();
    $response->getBody()->write(json_encode(['error' => 'token invalido o expirado', 'code' => 401]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(401);


});

require_once __DIR__ . '/routes.php';


$app->run();
