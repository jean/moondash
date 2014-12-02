---
layout: page
title:  "Mocking REST Backends"
---

# Mocking REST Backends

When building a frontend, you want to work fast with your customer. 
Using a mock REST API lets you create an entire app with a real REST 
API, which runs in your browser. The backend devs can later implement 
what you designed.

## The Need

The frontend/backend movement gives power to the frontend developers by
moving the UI out of the server. This lets you quickly build a powerful
UX and review it with your client. In most cases, this can mean just 
dropping off HTML/CSS/JS/PNG on a filesystem-delivered web server, 
backed by GitHub. Very productive, very fast, and not a big technology 
stack to drag around.
 
Until, that is, you start making REST API calls. Your application now 
can't run until you have a server.  Your workflow goes off the rails. 
Wouldn't it be great if you could have a pretend version of your actual
REST API, that didn't require a server? Then, when the customer 
approves the UX, the backend developers just implement your API.

## Features

- Make a fake version of your backend, running directly in the browser

- But allows non-API requests (e.g. loading images) to pass through

- Simulates real HTTP interactions (GET, POST, PUT, DELETE, etc.)

- Lets the frontend developer completely design the needs of the API

- Backend developers then know exactly what is expected of them

- Convenient helpers to register interceptors and enable/disable mocking

- Request/response JSON Schema validators can enforce the contract 
between what the frontend expects and what the backend later provides

## Example

You're going to want to deploy, on a static server, different flavors 
of your Moondash application. Some of these flavors should serve 
in-browser mocks while some might make actual calls to your backend. We
need a convenient way to flag that a certain URL should use your 
in-browser mocked REST API. We do this by putting the CSS class 
``.mockApi`` on any element:

{% highlight html %}
<body class="mockApi">
{% endhighlight %}

After than, any requests to ``/api/`` (or your registered API prefix) 
will either be intercepted with one of your registered mocks, or will 
give a 404. For example, one of your states might require some data as 
part of a ``resolve``:

{% highlight javascript %}
 resolve: {
   items: function ($http) {
     return $http.get('/api/people');
   }
 }
{% endhighlight %}

During development, you don't want this to stop working because you 
don't have a REST API on a server somewhere. Instead, register a mock:

{% highlight javascript %}
  var peopleData = {
    data: [
      {'id': 1, 'title': 'Ada Lovelace'},
      {'id': 2, 'title': 'Grace Hopper'}
    ]
  };

  moondashMockRestProvider.addMocks(
    'people',
    [
      {
        pattern: /api\/people$/, responseData: peopleData
      }
    ]);
{% endhighlight %}

You can also register mocks that handle POST for adding a new person, 
PUT for updating a person, DELETE for removing a person, etc. These 
operations can update the in-memory "database" of ``peopleData`` just 
as if your customer was using a real API.

## How It Works

AngularJS has an ``ngMocksE2E`` module which, when loaded, intercepts 
all HTTP interactions. You can then register callbacks whenever a 
certain method (GET, POST, etc.) matches a certain URL pattern. Your 
callback is then handed that actual input that came from your REST 
"client". You can process the input, update some in-memory data, and 
return a response.

Moondash augments this with some helpers that make it easy to turn the 
interceptor on/off and register handlers.

See the documentation on building the module for more details.