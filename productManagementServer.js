//import modules
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

//load the proto file
const packageDefinition = protoLoader.loadSync('productManagement.proto', {});
const productProto = grpc.loadPackageDefinition(packageDefinition).ProductManagement;

//array to store products
let products = [
  { id: '1', name: 'Scrub Daddy', inventory: 25 },
  { id: '2', name: 'Fairy', inventory: 10 },
  { id: '3', name: 'Cif', inventory: 40 },
  { id: '4', name: 'Domestos', inventory: 100 },
  { id: '5', name: 'W5', inventory: 20 },
  { id: '6', name: 'Windex', inventory: 10 },
  { id: '7', name: 'Mr. Clean', inventory: 25 },
  { id: '8', name: 'Clorox', inventory: 15 },
  { id: '9', name: 'Method', inventory: 45 },
  { id: '10', name: 'Febreze', inventory: 32 }
];

//create a new gRPC server
const server = new grpc.Server();

//add services to the server
server.addService(productProto.service, {
  //add product
  AddProduct: (call, callback) => {
    let duplicateFound = false;
    call.on('data', (product) => {
      const existingProduct = products.find(p => p.id === product.id);
      if (existingProduct) {
        console.log('A product with this ID already exists. Please choose another ID.');
        duplicateFound = true;
      } else {
        products.push(product);
      }
    });
    call.on('end', () => {
      if (duplicateFound) {
        callback(null, { message: 'A product with this ID already exists. Please choose another ID.' });
      } else {
        callback(null, { message: 'Products added successfully.'});
      }
    });
  },
  //get product details
  GetProductDetails: (call, callback) => {
    const productId = call.request.id;
    const productDetails = products.find(product => product.id === productId);
    callback(null, productDetails);
  },
//update product inventory
UpdateProductInventory: (call) => {
  call.on('data', (updateRequest) => {
    const existingProduct = products.find(p => p.id === updateRequest.id);
    if (existingProduct) {
      existingProduct.inventory = updateRequest.inventory;
      call.write({ message: `Product with id #${existingProduct.id} and name ${existingProduct.name} updated successfully with ${updateRequest.inventory} items`, product: existingProduct });
    } else {
      call.write({ message: `Product with ID ${updateRequest.id} not found` });
    }
  });
  call.on('end', () => {
    call.end();
  });
},
  //list all products
  ListAllProducts: (call) => {
    products.forEach((product) => {
      call.write(product);
    });
    call.end();
  }
});

//bind the server to a port
server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err != null) {
    console.error(err);
    return;
  }
  console.log(`Server running at http://127.0.0.1:${port}`);
});