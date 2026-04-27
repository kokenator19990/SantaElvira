CREATE TABLE "alerta" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipo_id" text NOT NULL,
	"periodo_id" integer NOT NULL,
	"kpi" text NOT NULL,
	"valor_actual" numeric(8, 2) NOT NULL,
	"umbral_critico" numeric(8, 2) NOT NULL,
	"estado" text NOT NULL,
	"mensaje" text NOT NULL,
	"resuelta" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analisis_apd" (
	"id" serial PRIMARY KEY NOT NULL,
	"periodo_id" integer NOT NULL,
	"fecha_analisis" date NOT NULL,
	"archivo_origen" text NOT NULL,
	"creado_por" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asarco_equipo" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipo_id" text NOT NULL,
	"periodo_id" integer NOT NULL,
	"pct_operativo" numeric(5, 2) NOT NULL,
	"pct_reserva" numeric(5, 2) NOT NULL,
	"pct_det_programada" numeric(5, 2) NOT NULL,
	"pct_det_no_prog" numeric(5, 2) NOT NULL,
	"pct_perdida_op" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipo" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo_flota_id" text NOT NULL,
	"modelo" text NOT NULL,
	"anio_fabricacion" integer NOT NULL,
	"en_servicio" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_equipo" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipo_id" text NOT NULL,
	"periodo_id" integer NOT NULL,
	"dfm" numeric(5, 2) NOT NULL,
	"tmef" numeric(6, 1) NOT NULL,
	"tmpr" numeric(5, 1) NOT NULL,
	"tiempo_operativo" numeric(5, 2) NOT NULL,
	"reserva" numeric(5, 2) NOT NULL,
	"horas_acumuladas" integer NOT NULL,
	"paro_total" boolean DEFAULT false NOT NULL,
	"motivo_paro" text,
	"creado_por" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muestra_apd" (
	"id" serial PRIMARY KEY NOT NULL,
	"analisis_id" integer NOT NULL,
	"equipo_id" text NOT NULL,
	"compartimento" text NOT NULL,
	"parametro" text NOT NULL,
	"valor" numeric(12, 4) NOT NULL,
	"unidad" text NOT NULL,
	"limite_minimo" numeric(12, 4),
	"limite_maximo" numeric(12, 4),
	"estado" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "periodo" (
	"id" serial PRIMARY KEY NOT NULL,
	"anio" integer NOT NULL,
	"mes" integer NOT NULL,
	"label" text NOT NULL,
	"cerrado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipo_flota" (
	"id" text PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"descripcion" text NOT NULL,
	"fabricante" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umbral_kpi" (
	"id" serial PRIMARY KEY NOT NULL,
	"kpi" text NOT NULL,
	"nivel_verde" numeric(8, 2) NOT NULL,
	"nivel_ambar" numeric(8, 2) NOT NULL,
	"invertido" boolean DEFAULT false NOT NULL,
	"vigente_desde" date NOT NULL,
	"vigente_hasta" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_periodo_id_periodo_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analisis_apd" ADD CONSTRAINT "analisis_apd_periodo_id_periodo_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asarco_equipo" ADD CONSTRAINT "asarco_equipo_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asarco_equipo" ADD CONSTRAINT "asarco_equipo_periodo_id_periodo_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipo" ADD CONSTRAINT "equipo_tipo_flota_id_tipo_flota_id_fk" FOREIGN KEY ("tipo_flota_id") REFERENCES "public"."tipo_flota"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_equipo" ADD CONSTRAINT "kpi_equipo_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_equipo" ADD CONSTRAINT "kpi_equipo_periodo_id_periodo_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muestra_apd" ADD CONSTRAINT "muestra_apd_analisis_id_analisis_apd_id_fk" FOREIGN KEY ("analisis_id") REFERENCES "public"."analisis_apd"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muestra_apd" ADD CONSTRAINT "muestra_apd_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "asarco_equipo_periodo_uq" ON "asarco_equipo" USING btree ("equipo_id","periodo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kpi_equipo_periodo_uq" ON "kpi_equipo" USING btree ("equipo_id","periodo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "periodo_anio_mes_uq" ON "periodo" USING btree ("anio","mes");