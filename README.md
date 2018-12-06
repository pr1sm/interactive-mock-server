# Interactive Mock Server

An mock server that allows you to dynamically adjust mock endpoints in real-time!

## Overview

Almost all mock server implementations provide the option to specify mock routes/endpoints 
beforehande, but they don't allow you to dynamically adjust those routes after a certain 
amount of time. While those implementations are geared toward CI environment testing, manual 
testing of you app is also important.

### Exploring Different Responses

How your app responds to different responses requires a type of exploration that other mock 
servers don't have. The ability to adjust a route's response dynamically allows you to test 
how the app responds to different responses from the same route _over time_. This also allows 
you to explore how the app responds to unexpected responses without having to copy boilerplate 
code, adjust one small part (such as the the status code) and restart the server. 

Instead this mock server provides an interactive way of adjusting simple parts of the mocked 
response without having to stop and start the mock server over and over.

### Using the dashboard

Once the server is started (see instructions on running below), You can navigate to the
dashboard page `/__dashboard`. This route exists as a way to prevent conflicts with other 
potential mock endpoints. From this page, you can view endpoints (`/__dashboard/endpoints`), 
create a new endpoint (`/__dashboard/endpoints/new`) or view/edit an existing endpoint 
(`/__dashboard/endpoints/:id`). 

Once an endpoint has been created, it will be automatically enabled on the mock server. 

## Running the Mock Server

Instructions TBD! (You can use the contributing instructions for running in dev mode at this time)

## Contributing

### Debugging

1. Clone the project
2. Install dependencies: `npm install`
3. Build the frontend: `npm run build`
4. Launch the server: `npm run start:appdev`
5. Navigate to the dashboard: (default is `http://localhost:9000/__dashboard`)

Created mock endpoints are available from the same base: `http://localhost:9000/`

### Debugging the frontend

Repeat steps 1-4 above and

5. Launch the webpack dev server: `npm run start:webdev`
6. Navigate to the development dashboard: (default is `http://localhost:9100/__dashboard`)

> NOTE: The mock server must also be running in a separate terminal (Step 4). The dashboard uses 
> several API methods from the mock server that are automatically proxied to the mock server.

> ALSO NOTE: All created mock endpoints will be available using the mock server, NOT the webpack
> dev server. You will have to go to `http://localhost:9000` instead of `http://localhost:9100` 
> to test the mock endpoints created