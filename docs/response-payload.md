---
layout: page
title:  "Response payloads"
---

# Response Payloads

A set of conventions for the information in the JSON body of 
Moondash-compliant REST endpoints.

## Background

In general, applications plugged into Moondash can handle any kind of 
REST endpoint. Some of the Moondash services and expectations, though, 
will require some conventions on REST responses that want to "play 
ball" with those services.

As an implementation note, Moondash uses Restangular, JSON Schemas, and
 JSON-LD. All of these inform the thinking herein, as well as HATEOAS.

## Structure

Every Moondash-ish response will be an object, not a list. We will use 
the Restangular approach of unpacking described at:

https://github.com/mgonto/restangular#my-response-is-actually-wrapped-with-some-metadata-how-do-i-get-the-data-in-that-case

The top-level of the object will have the following structure:

{% highlight json %}
{
  "resource": {
  },
  "items": [
  ],
  "errors": [
  ]
}
{% endhighlight %}

The information about the requested resource will be under 
``resource``. If the API call resulted in some errors (e.g. form 
validation errors), those will be listed in a sequence under ``errors``. 
It is expected that ``resource`` will contain a JSON-LD datastructure.

If an item is a collection, we will have a top-level ``items`` property
as a list. Later we will have some pagination controls.

The Restangular interceptor will extract the response information and 
return ...

## Caching

Restangular can handle caching, if you set Etags and If-None-Match. But
we should document the expectations.

## Response Codes

Moondash registers some AngularJS response interceptors to handle 
various conditions (Not Found, Unauthorized, Forbidden, General Error.)
 Each of these results in a transition to a state defined in Moondash.