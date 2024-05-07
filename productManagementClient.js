//import modules
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

//create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//load the proto file and create a client
const packageDefinition = protoLoader.loadSync('./productManagement.proto', {});
const productProto = grpc.loadPackageDefinition(packageDefinition);

const client = new productProto.ProductManagement('localhost:50051', grpc.credentials.createInsecure());

//function to ask user for input and return the input
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

//main function
async function main() {
  //display the options to the user
  console.log('Select an operation:');
  console.log('1: AddProduct');
  console.log('2: GetProductDetails');
  console.log('3: UpdateProductInventory');
  console.log('4: ListAllProducts');

  //ask user for choice
  const choice = await askQuestion('Enter choice: ');
  switch (choice) {
    //add product
    case '1':
      let addAnotherProduct = 'y';
      while (addAnotherProduct.toLowerCase() === 'y') {
        const addProductStream = client.AddProduct((error, response) => {
          if (error) {
            console.error(error);
          } else {
            console.log(response.message);
          }
        });
        const productToAdd = await askQuestion('Enter product details (id, name, inventory): ');
        const [id, name, inventory] = productToAdd.split(',');
        addProductStream.write({ id, name, inventory: parseInt(inventory, 10) });
        addProductStream.end();
        addAnotherProduct = await askQuestion('Do you want to add another product? (y/n): ');
      }
      rl.close();
      break;
    //get product details
    case '2':
      const productId = await askQuestion('Enter product id: ');
      client.GetProductDetails({ id: productId }, (error, product) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Product details:', product);
        }
        rl.close();
      });
      break;
    //update product inventory
    case '3':
      let updateAnotherProduct = 'y';
      const updateProductStream = client.UpdateProductInventory();
      updateProductStream.on('data', (response) => {
        console.log(response.message);
        if (response.product) {
          console.log('Updated product:', response.product);
        }
      });
      updateProductStream.on('end', () => {
        rl.close();
      });
    
      while (updateAnotherProduct.toLowerCase() === 'y') {
        const productToUpdate = await askQuestion('Enter product details to update (id, inventory): ');
        const [updateId, updateInventory] = productToUpdate.split(',');
        updateProductStream.write({ id: updateId, inventory: parseInt(updateInventory, 10) });
        updateAnotherProduct = await askQuestion('Do you want to update another product? (y/n): ');
      }
    
      updateProductStream.end();
      break;
    //list all products
    case '4':
      const listAllProductsStream = client.ListAllProducts({});
      listAllProductsStream.on('data', (product) => {
        console.log(`Product id: ${product.id}, name: ${product.name}, inventory: ${product.inventory}`);
      });
      listAllProductsStream.on('end', () => {
        rl.close();
      });
      break;
    default:
      console.log('Invalid choice');
      rl.close();
      break;
  }
}

//call the main function
main();