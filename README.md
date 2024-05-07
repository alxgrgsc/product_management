# gRPC Product Management Service

## Overview

This repository contains a gRPC-based product management service. It allows users to perform various operations related to product management, including adding products, retrieving product details, updating product inventory, and listing all products.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)


## Installation

1. Clone this repository to your local machine:



## Usage

1. Start the server:

  node productManagementServer.js

2. Use the provided gRPC client to interact with the service. Example client code can be found in the `client.js` file.

  node productManagementClient.js

3. Follow the prompts in the client interface to perform operations such as adding products, retrieving product details, updating product inventory, and listing all products.

## API Reference

The service defines the following RPC methods:

- `AddProduct`: Adds a new product to the inventory.
- `GetProductDetails`: Retrieves details of a specific product.
- `UpdateProductInventory`: Updates the inventory count of a product.
- `ListAllProducts`: Lists all products in the inventory.

For detailed information on request and response formats, refer to the `productManagement.proto` file.


