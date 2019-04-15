// Imports
importScripts('js/sw-utils.js');

// Tipos de cache con sus respectivas versiones
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Archivos básicos para que funcione la aplicación
const APP_SHELL = [
    //'/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js'
];

// Librerías de 3ros que no cambian
INMUTABLE_APP_SHELL = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js',
    'js/sw-utils.js'
]

// Acciones al instalar el SW
self.addEventListener( 'install' , e => {

    // Abro/guardo los datos básicos de la aplicación
    const staticCache = caches.open( STATIC_CACHE )
        .then( cache => cache.addAll( APP_SHELL ));
    
    const inmutableCache = caches.open( INMUTABLE_CACHE )
        .then( cache => cache.addAll( INMUTABLE_APP_SHELL ));

    // Espero a que se resuelven las promesas
    e.waitUntil( Promise.all( [ staticCache , inmutableCache ] ) );
});

// Acciones cuando se activa el SW
self.addEventListener( 'activate' , e => {
    
    // Verifico la version del cache estático y borro las viejas si es que hay
    const response = caches.keys()
        .then( keys => {
            keys.forEach( key => {
                if ( key !== STATIC_CACHE && key.includes( 'static' ) ) {
                    return caches.delete(key);
                }
            })
        });
    
    e.waitUntil( response );
});

// Acciones cuando el SW realiza las peticiones
self.addEventListener( 'fetch' , e => {

    // Estrategia cache all
    const response = caches.match( e.request )
        .then( res => {
             
            if ( res ) {

                return res;

            } else {

                return fetch( e.request )
                    .then( newRes => {
                        return updateDynamicCache( DYNAMIC_CACHE , e.request ,  newRes );
                    });
            }
        });
    

    e.respondWith( response );
});