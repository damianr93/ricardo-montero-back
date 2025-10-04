import bcrypt from 'bcrypt';

export const seedData = {
  users: [
    {
      name: "Admin Usuario",
      email: "admin@montero.com",
      password: bcrypt.hashSync("123456", 10),
      role: ["ADMIN_ROLE"],
      emailValidated: true,
      approvalStatus: "APPROVED",
      razonSocial: "Montero Admin",
      CUIT: "20-12345678-9",
      phone: "1234567890",
      direccion: "Calle Admin 123",
      localidad: "Buenos Aires",
      provincia: "Buenos Aires",
      codigoPostal: 1000
    },
    {
      name: "Usuario Test",
      email: "user@montero.com",
      password: bcrypt.hashSync("123456", 10),
      role: ["USER_ROLE"],
      emailValidated: true,
      approvalStatus: "APPROVED",
      razonSocial: "Usuario Test",
      CUIT: "20-87654321-0",
      phone: "0987654321",
      direccion: "Calle Usuario 456",
      localidad: "Córdoba",
      provincia: "Córdoba",
      codigoPostal: 5000
    }
  ],
  categories: [
    {
      name: "Cerámica",
      available: true
    },
    {
      name: "Plantas",
      available: true
    },
    {
      name: "Flores",
      available: true
    },
    {
      name: "Coronas",
      available: true
    }
  ],
  products: [
    {
      name: "Maceta Cerámica Grande",
      available: true,
      codigo: "CER001",
      price: 2500,
      title: "Maceta de cerámica artesanal",
      description: "Hermosa maceta de cerámica hecha a mano, perfecta para plantas grandes",
      img: ["ceramica.png"]
    },
    {
      name: "Planta de Interior",
      available: true,
      codigo: "PLA001",
      price: 1800,
      title: "Planta de interior resistente",
      description: "Planta de interior que requiere poco mantenimiento",
      img: ["plantas.jpg"]
    },
    {
      name: "Ramo de Flores",
      available: true,
      codigo: "FLO001",
      price: 3200,
      title: "Ramo de flores frescas",
      description: "Hermoso ramo de flores frescas para ocasiones especiales",
      img: ["flores.png"]
    },
    {
      name: "Corona Funeraria",
      available: true,
      codigo: "COR001",
      price: 4500,
      title: "Corona funeraria elegante",
      description: "Corona funeraria elegante y respetuosa",
      img: ["corona.png"]
    }
  ]
};
