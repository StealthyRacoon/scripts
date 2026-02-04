$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://+:8080/')
$listener.Start()

try {
    while ($true) {
        $context = $listener.GetContext()
        
        $query = $context.Request.Url.Query
        $params = [System.Web.HttpUtility]::ParseQueryString($query)
        $name = $params['name']
        
        # Fixed: Handle null/empty name
        if ([string]::IsNullOrEmpty($name)) {
            $name = 'World'
        }
        
        $response = "Hello, $name!"
        $bytes = [Text.Encoding]::UTF8.GetBytes($response)
        
        $context.Response.ContentType = 'text/plain'
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
    }
}
finally {
    $listener.Stop()
}