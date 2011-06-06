# node.restredis.js

node.restredis.js is a node.js server that stores and retrieves keys with HTTP methods (POST, GET, PUT, DELETE).

It prefixes the keys with value of _"host"_ from HTTP header.

### Example
    
    $ curl -X POST -d "value" zordon.example.com/test
    => OK
    
    $ curl zordon.example.com/test
    => value
    
    $ curl -X POST -d "other value" godzilla.example.com/test
    => OK
    
    $ curl godzilla.example.com/test
    => other value
    
    $ curl zordon.example.com/test
    => value
    
    $ curl -X PUT -d "Japan!" godzilla.example.com/test
    => OK
    
    $ curl -X DELETE godzilla.example.com/test
    => OK
    
    $ curl -X DELETE godzilla.example.com/non-existent
    => Specified key does not exists.
