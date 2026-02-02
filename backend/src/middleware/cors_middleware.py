from typing import Union
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response as StarletteResponse
from starlette.types import ASGIApp


class CORSMiddlewareHandler:
    """
    Custom CORS middleware handler to manage cross-origin requests
    """
    def __init__(
        self,
        app: ASGIApp,
        allow_origins: Union[list, str] = None,
        allow_credentials: bool = False,
        allow_methods: Union[list, str] = None,
        allow_headers: Union[list, str] = None,
    ):
        self.app = app
        self.allow_origins = allow_origins or []
        self.allow_credentials = allow_credentials
        self.allow_methods = allow_methods or ["*"]
        self.allow_headers = allow_headers or ["*"]

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope)
        origin = request.headers.get("origin")

        # Check if origin is allowed
        if origin and (origin in self.allow_origins or "*" in self.allow_origins):
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    # Add CORS headers
                    headers = [(k.decode(), v.decode()) for k, v in message.get("headers", [])]
                    
                    # Add Access-Control-Allow-Origin header
                    headers.append(("access-control-allow-origin", origin))
                    
                    # Add Access-Control-Allow-Credentials if enabled
                    if self.allow_credentials:
                        headers.append(("access-control-allow-credentials", "true"))
                    
                    # Add Access-Control-Allow-Methods
                    methods_str = ", ".join(self.allow_methods)
                    headers.append(("access-control-allow-methods", methods_str))
                    
                    # Add Access-Control-Allow-Headers
                    headers_str = ", ".join(self.allow_headers)
                    headers.append(("access-control-allow-headers", headers_str))
                    
                    # Add Access-Control-Max-Age for preflight caching (24 hours)
                    headers.append(("access-control-max-age", "86400"))
                    
                    message["headers"] = [(k.encode(), v.encode()) for k, v in headers]
                
                await send(message)

            # Handle preflight requests
            if request.method == "OPTIONS":
                # Create a response for preflight request
                response_headers = [
                    (b"access-control-allow-origin", origin.encode()),
                    (b"access-control-allow-credentials", b"true" if self.allow_credentials else b"false"),
                    (b"access-control-allow-methods", ", ".join(self.allow_methods).encode()),
                    (b"access-control-allow-headers", ", ".join(self.allow_headers).encode()),
                    (b"access-control-max-age", b"86400"),  # Cache preflight for 24 hours
                ]
                
                response = StarletteResponse(status_code=200, headers=dict(response_headers))
                await response(scope, receive, send)
                return

        # Process the request normally
        await self.app(scope, receive, send_wrapper)