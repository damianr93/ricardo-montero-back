import { envs } from "../../config";
import { CategoryModel } from "../mongo/models/category.model";
import { ProductModel } from "../mongo/models/product.model";
import { UserModel } from "../mongo/models/user.model";
import { MongoDataBase } from "../mongo/mongo-database";
import { seedData } from "./data";


(async()=> {

    await MongoDataBase.connect({
        dbName:envs.MONGO_DB_NAME,
        mongoUrl:envs.MONGO_URL
    });

    await main();

    await MongoDataBase.disconect()
})();


const randomBetween0AndX = ( x: number) => {
    return Math.floor( Math.random() * x )
}


async function main() {

    // 0. Borrar todo
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
    ]);

    // 1. Crear usuarios
    const users = await UserModel.insertMany(seedData.users)

    // 2. Crear categoria
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => {
            return{
                ...category,
                user: users[0]._id
            }
        })
    )

    // 3. Crear productos
    const products = await ProductModel.insertMany(
        seedData.products.map(product => {
            return {
                ...product,
                user: users[randomBetween0AndX(seedData.users.length - 1)]._id,
                category:categories[randomBetween0AndX(seedData.categories.length - 1) ]._id
            }
        })
    )
};

