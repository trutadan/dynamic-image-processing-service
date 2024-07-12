# Dynamic image processing service

## Introduction

### Client requirements
We need to build a dynamic image processing service. This service is tasked with managing a collection of image files, which are to be stored locally (feel free to use a selection of diverse images from the internet as initial data). The service is designed to handle HTTP requests targeting specific images through a dedicated endpoint (e.g., /images/picture_98765.jpg). It must offer the capability to deliver images in various resolutions based on the request parameters. For example, accessing /images/picture_98765.jpg?resolution=250x350 would adjust the image to a 250x350 resolution before serving it to the requester. This functionality enables the delivery of images that are tailored to the display requirements of different devices, with mobile devices typically requesting lower resolutions, whereas desktop applications might request higher resolutions or the original image.

### Execution
This project was implemented using modern web development technologies. The application handles image requests through defined endpoints, processes images, and caches them to optimize performance. Additionally, the service provides endpoints for monitoring usage statistics.

### Technologies Used
- **Node.js**
- **TypeScript**
- **Express**
- **Redis**: Implemented as a caching layer to store processed images and various statistics, improving the performance and scalability of the service.
- **Docker**: Employed to containerize the application, ensuring consistency across different environments and simplifying deployment and scalability.
- **Jest**: Chosen for its testing features, which enable writing efficient integration tests to ensure the reliability of the service.
- **Swagger**: Integrated for API documentation and testing, providing an interactive interface for users to explore and test the API endpoints.

## Setup and Installation

### Prerequisites
To set up and run this service, you need to have the following installed on your system:

- **Docker**: Ensure you have Docker installed. You can download it from [here](https://www.docker.com/products/docker-desktop).
- **Docker Compose**: This is typically included with Docker Desktop, but you can also install it separately if needed. You can find installation instructions [here](https://docs.docker.com/compose/install/).

### Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/trutadan/dynamic-image-processing-service.git
    cd dynamic-image-processing-service
    git checkout development
    ```

2. **Build and start the services:**
    ```bash
    docker-compose up --build
    ```

3. **Access the service:**
    - The image processing API will be available at `http://localhost:3000/api/images/{filename}`
    - The statistics API will be available at `http://localhost:3000/api/statistics`
    - Swagger documentation can be accessed at `http://localhost:3000/api-docs`

  
## Usage

### Adding new images
   - Place new images in the `images` directory located at the root of the project.
   - The service will automatically detect and process these images when requested.

### Image processing
#### Retrieve an image
To retrieve an image, make a GET request to the following endpoint: *GET /api/images/{filename}*
- **Parameters:**
  - `filename`: The name of the image file you want to retrieve.
  - `resolution` (optional): The desired resolution in the format `{width}x{height}`.

- **Examples:**
  - Retrieve the original image:
    ```
    GET /api/images/sample.jpg
    ```
  - Retrieve the image with a specific resolution:
    ```
    GET /api/images/sample.jpg?resolution=250x350
    ```
    
- **Response:**
  - **200 OK**: The requested image.
  - **400 Bad Request**: Validation error, such as invalid resolution format.
  - **404 Not Found**: The image does not exist.
  - **500 Internal Server Error**: An error occurred while processing the image.

#### Retrieve service statistics
To retrieve service statistics, make a GET request to the following endpoint: *GET /api/statistics*

- **Response:**
  - **200 OK**: JSON object containing various statistics about the service.
  - **500 Internal Server Error**: An error occurred while retrieving the statistics.

- **Example:**
  ```json
  {
    "totalImages": 100,
    "resizedImages": 50,
    "cacheHits": 200,
    "cacheMisses": 100,
    "totalRequests": 300,
    "totalErrors": 10,
    "averageProcessingTime": "150.00 ms",
    "mostRequestedResolutions": {
      "250x350": 10,
      "500x700": 5
    },
    "mostRequestedImages": {
      "sample.jpg": 15,
      "example.png": 8
    },
    "cacheSize": 500,
    "cacheHitMissRatio": "2.00",
    "requestSuccessErrorRatio": "29.00"
  }
  
Each statistic is selected to provide useful insights into the performance and usage of the service:
- **totalImages**: Indicates the number of images available for processing. Useful for understanding the size of the dataset.
- **resizedImages:** Shows the number of images that have been resized. Helps in understanding the usage pattern.
- **cacheHits:** The number of times a requested image was found in the cache. A higher number indicates effective caching, which improves performance.
- **cacheMisses:** The number of times a requested image was not found in the cache. Helps identify possibilities to improve caching strategies.
- **totalRequests:** The total number of requests received by the service. Useful for monitoring overall traffic and usage.
- **totalErrors:** The number of errors encountered by the service. Helps in identifying issues and improving service stability.
- **averageProcessingTime:** The average time taken to process requests. Essential for performance monitoring and optimization.
- **mostRequestedResolutions:** The resolutions that are most frequently requested. Useful for optimizing the service to handle popular resolutions efficiently.
- **mostRequestedImages:** The images that are most frequently requested. Helps in caching popular images to improve response times.
- **cacheSize:** The current size of the cache. Useful for monitoring cache utilization.
- **cacheHitMissRatio:** The ratio of cache hits to misses. A higher ratio indicates better caching performance.
- **requestSuccessErrorRatio:** The ratio of successful requests to errors. Helps in monitoring the overall reliability and success rate of the service.

### Postman for manual testing
Here's how you can use Postman to test the image processing service:

1. **Download and install Postman**: If you haven't already, download and install Postman from [here](https://www.postman.com/downloads/).

2. **Retrieve an image**:
   - Open Postman and create a new GET request.
   - Enter the request URL: `http://localhost:3000/api/images/{filename}` (replace `{filename}` with the actual image filename, e.g., `sample.jpg`).
   - Add an optional query parameter for resolution if needed (e.g., `resolution=250x350`).
   - Click on `Send` to make the request and view the response.

   Example: *GET http://localhost:3000/api/images/sample.jpg*

   Example with resolution: *GET http://localhost:3000/api/images/sample.jpg?resolution=250x350*

3. **Retrieve service statistics**:
- Open Postman and create a new GET request.
- Enter the request URL: `http://localhost:3000/api/statistics`.
- Click on `Send` to make the request and view the response.

Example: *GET http://localhost:3000/api/statistics*

### Swagger API Documentation
Swagger provides a user-friendly interface to explore and test the API endpoints. Here's how you can access and use Swagger for the image processing service:

1. **Access Swagger UI**:
- Ensure the service is running.
- Open a web browser and navigate to: `http://localhost:3000/api-docs`.

2. **Explore API endpoints**:
- The Swagger UI will display all available API endpoints along with their details.
- You can expand each endpoint to view its parameters, responses, and example requests.

3. **Test API endpoints**:
- Swagger UI allows you to test the API endpoints directly from the interface.
- Enter the required parameters and click on the `Execute` button to make the request and view the response.

### Testing

#### Prerequisites
Before running the tests, ensure you have the necessary dependencies installed.

1. **Node.js**: Make sure you have Node.js installed on your system. You can download it from [here](https://nodejs.org/). Follow the installation instructions for your operating system.

2. **Project dependencies**: Once Node.js is installed, navigate to the project directory and run:

   ```bash
   npm install
   ```

   This will install all the required packages listed in the package.json file.

#### Running tests
To execute the tests and check the coverage, use the following command:

```bash
npx jest --coverage
```

#### Interpreting the coverage report
This command runs all the tests and generates a coverage report. 
The report will show the percentage of statements, branches, functions, and lines covered by the tests.
The service is designed to achieve 100% test coverage, ensuring all functionalities are thoroughly tested. 
It should look similar to this:
![Coverage report](https://github.com/trutadan/dynamic-image-processing-service/coverage.png)


## Conclusion
Thank you for taking the time to explore this service. I hope you liked it and found it useful. If you have any questions or feedback, please feel free to reach out.
Happy coding! 💻
