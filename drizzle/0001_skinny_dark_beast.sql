CREATE TABLE "evento_falla" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipo_id" text NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"descripcion" text NOT NULL,
	"componente" text,
	"hrs_reparacion" numeric(5, 1) NOT NULL,
	"resuelta" boolean DEFAULT false NOT NULL,
	"creado_por" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registro_diario" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipo_id" text NOT NULL,
	"fecha" date NOT NULL,
	"turno" text DEFAULT 'completo' NOT NULL,
	"hrs_operacion" numeric(5, 2) NOT NULL,
	"hrs_reserva" numeric(5, 2) NOT NULL,
	"hrs_det_programada" numeric(5, 2) NOT NULL,
	"hrs_det_no_programada" numeric(5, 2) NOT NULL,
	"hrs_perdida_op" numeric(5, 2) NOT NULL,
	"observaciones" text,
	"creado_por" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evento_falla" ADD CONSTRAINT "evento_falla_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_diario" ADD CONSTRAINT "registro_diario_equipo_id_equipo_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "registro_diario_eq_fecha_turno_uq" ON "registro_diario" USING btree ("equipo_id","fecha","turno");