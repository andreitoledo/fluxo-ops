-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'FINANCIAL', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'WAITING_PAYMENT', 'PAYMENT_APPROVED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'CLIENT', 'PRODUCT', 'ORDER', 'ORDER_ITEM', 'PAYMENT_APPROVAL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "UserRole" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "documento" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "nome_contato" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_base" DECIMAL(14,2) NOT NULL,
    "prazo_padrao_producao_dias" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "numero_pedido" TEXT NOT NULL,
    "cliente_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "status_pagamento" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "valor_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "producao_iniciada_em" TIMESTAMP(3),
    "producao_concluida_em" TIMESTAMP(3),
    "expedido_em" TIMESTAMP(3),
    "concluido_em" TIMESTAMP(3),
    "data_prevista_producao" TIMESTAMP(3),
    "data_prevista_expedicao" TIMESTAMP(3),
    "observacoes_internas" TEXT,
    "criado_por_usuario_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "produto_nome_snapshot" TEXT NOT NULL,
    "preco_unitario" DECIMAL(14,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "status_anterior" "OrderStatus",
    "novo_status" "OrderStatus" NOT NULL,
    "alterado_por_usuario_id" UUID NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprovacoes_pagamento" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "aprovado_por_usuario_id" UUID,
    "observacao_decisao" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aprovacoes_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "tipo_entidade" "AuditEntityType" NOT NULL,
    "entidade_id" UUID NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "usuario_id" UUID,
    "pedido_id" UUID,
    "metadata_json" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_perfil" ON "usuarios"("perfil");

-- CreateIndex
CREATE INDEX "idx_usuarios_ativo" ON "usuarios"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");

-- CreateIndex
CREATE INDEX "idx_clientes_razao_social" ON "clientes"("razao_social");

-- CreateIndex
CREATE INDEX "idx_clientes_nome_fantasia" ON "clientes"("nome_fantasia");

-- CreateIndex
CREATE INDEX "idx_clientes_documento" ON "clientes"("documento");

-- CreateIndex
CREATE INDEX "idx_clientes_ativo" ON "clientes"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");

-- CreateIndex
CREATE INDEX "idx_produtos_nome" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "idx_produtos_sku" ON "produtos"("sku");

-- CreateIndex
CREATE INDEX "idx_produtos_ativo" ON "produtos"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_pedido_key" ON "pedidos"("numero_pedido");

-- CreateIndex
CREATE INDEX "idx_pedidos_numero_pedido" ON "pedidos"("numero_pedido");

-- CreateIndex
CREATE INDEX "idx_pedidos_cliente_id" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_pedidos_status" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "idx_pedidos_status_pagamento" ON "pedidos"("status_pagamento");

-- CreateIndex
CREATE INDEX "idx_pedidos_criado_por_usuario_id" ON "pedidos"("criado_por_usuario_id");

-- CreateIndex
CREATE INDEX "idx_pedidos_criado_em" ON "pedidos"("criado_em");

-- CreateIndex
CREATE INDEX "idx_pedidos_data_prevista_producao" ON "pedidos"("data_prevista_producao");

-- CreateIndex
CREATE INDEX "idx_pedidos_data_prevista_expedicao" ON "pedidos"("data_prevista_expedicao");

-- CreateIndex
CREATE INDEX "idx_itens_pedido_pedido_id" ON "itens_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_itens_pedido_produto_id" ON "itens_pedido"("produto_id");

-- CreateIndex
CREATE INDEX "idx_historico_status_pedido_pedido_id" ON "historico_status_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_historico_status_pedido_usuario_id" ON "historico_status_pedido"("alterado_por_usuario_id");

-- CreateIndex
CREATE INDEX "idx_historico_status_pedido_criado_em" ON "historico_status_pedido"("criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "aprovacoes_pagamento_pedido_id_key" ON "aprovacoes_pagamento"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_aprovacoes_pagamento_pedido_id" ON "aprovacoes_pagamento"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_aprovacoes_pagamento_status" ON "aprovacoes_pagamento"("status");

-- CreateIndex
CREATE INDEX "idx_aprovacoes_pagamento_usuario_id" ON "aprovacoes_pagamento"("aprovado_por_usuario_id");

-- CreateIndex
CREATE INDEX "idx_logs_auditoria_entidade" ON "logs_auditoria"("tipo_entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "idx_logs_auditoria_usuario_id" ON "logs_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_logs_auditoria_pedido_id" ON "logs_auditoria"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_logs_auditoria_criado_em" ON "logs_auditoria"("criado_em");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_criado_por_usuario_id_fkey" FOREIGN KEY ("criado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_pedido" ADD CONSTRAINT "historico_status_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_pedido" ADD CONSTRAINT "historico_status_pedido_alterado_por_usuario_id_fkey" FOREIGN KEY ("alterado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprovacoes_pagamento" ADD CONSTRAINT "aprovacoes_pagamento_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprovacoes_pagamento" ADD CONSTRAINT "aprovacoes_pagamento_aprovado_por_usuario_id_fkey" FOREIGN KEY ("aprovado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
