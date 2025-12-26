"use strict";(()=>{var e={};e.id=698,e.ids=[698],e.modules={53524:e=>{e.exports=require("@prisma/client")},98432:e=>{e.exports=require("bcryptjs")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},64052:(e,a,r)=>{r.r(a),r.d(a,{originalPathname:()=>l,patchFetch:()=>N,requestAsyncStorage:()=>c,routeModule:()=>u,serverHooks:()=>m,staticGenerationAsyncStorage:()=>p});var o={};r.r(o),r.d(o,{POST:()=>d});var s=r(49303),t=r(88716),i=r(60670),n=r(87070);async function d(e){try{let{searchParams:a}=new URL(e.url),o=a.get("secret");if("insert-data-2024"!==o)return n.NextResponse.json({error:"Unauthorized"},{status:401});let{PrismaClient:s}=await Promise.resolve().then(r.t.bind(r,53524,23)),t=await Promise.resolve().then(r.t.bind(r,98432,23)),i=new s;console.log("\uD83D\uDE80 Inserindo dados no PostgreSQL Railway..."),await i.$executeRaw`
      INSERT INTO categories (id, name, description, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'Motor', 'Peças relacionadas ao motor do veículo', NOW(), NOW()),
        (gen_random_uuid(), 'Freios', 'Sistema de freios e componentes', NOW(), NOW()),
        (gen_random_uuid(), 'Suspensão', 'Componentes do sistema de suspensão', NOW(), NOW()),
        (gen_random_uuid(), 'Transmissão', 'Caixa de câmbio e transmissão', NOW(), NOW()),
        (gen_random_uuid(), 'Elétrica', 'Componentes elétricos e eletrônicos', NOW(), NOW()),
        (gen_random_uuid(), 'Carroceria', 'Peças da carroceria e lataria', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `,console.log("✅ Categorias inseridas"),await i.$executeRaw`
      INSERT INTO suppliers (id, name, email, phone, address, cnpj, contact, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'AutoPeças Brasil Ltda', 'vendas@autopecasbrasil.com.br', '(11) 3456-7890', 'Rua das Autopeças, 123 - São Paulo/SP', '12.345.678/0001-90', 'João Silva', NOW(), NOW()),
        (gen_random_uuid(), 'Distribuidora Nacional', 'comercial@distnacional.com.br', '(21) 2345-6789', 'Av. Industrial, 456 - Rio de Janeiro/RJ', '23.456.789/0001-01', 'Maria Santos', NOW(), NOW()),
        (gen_random_uuid(), 'Peças Premium', 'atendimento@pecaspremium.com.br', '(11) 4567-8901', 'Rua Premium, 789 - São Paulo/SP', '34.567.890/0001-12', 'Carlos Lima', NOW(), NOW())
      ON CONFLICT (cnpj) DO NOTHING;
    `,console.log("✅ Fornecedores inseridos");let d=await t.hash("123456",10);await i.$executeRaw`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
      VALUES 
        (gen_random_uuid(), 'vendedor@autopecas.com', 'José Vendedor', ${d}, 'USER', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `,console.log("✅ Usu\xe1rio vendedor inserido");let u=await i.category.count(),c=await i.supplier.count(),p=await i.user.count();return await i.$disconnect(),n.NextResponse.json({success:!0,message:"Dados inseridos com sucesso no PostgreSQL Railway!",data:{categories:u,suppliers:c,users:p},insertedData:{categories:6,suppliers:3,testUser:1},testCredentials:{admin:{email:"admin@autopecas.com",password:"admin123"},vendedor:{email:"vendedor@autopecas.com",password:"123456"}}})}catch(e){return console.error("Insert error:",e),n.NextResponse.json({error:"Erro ao inserir dados",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let u=new s.AppRouteRouteModule({definition:{kind:t.x.APP_ROUTE,page:"/api/insert-data/route",pathname:"/api/insert-data",filename:"route",bundlePath:"app/api/insert-data/route"},resolvedPagePath:"D:\\sistema-auto-pecas\\src\\app\\api\\insert-data\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:c,staticGenerationAsyncStorage:p,serverHooks:m}=u,l="/api/insert-data/route";function N(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:p})}}};var a=require("../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),o=a.X(0,[276,972],()=>r(64052));module.exports=o})();