--
-- PostgreSQL database dump
--

\restrict cASoQ6dnSOdASOCAEc5X80SPWRyYJEo01Y4AMsAnP3ucQy90QCEYmd3S5JFWgeB

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EstadoPedido; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoPedido" AS ENUM (
    'PENDIENTE',
    'PREPARACION',
    'LISTO',
    'CANCELADO',
    'PAGADO'
);


ALTER TYPE public."EstadoPedido" OWNER TO postgres;

--
-- Name: MetodoPago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MetodoPago" AS ENUM (
    'EFECTIVO',
    'TARJETA',
    'TRANSFERENCIA'
);


ALTER TYPE public."MetodoPago" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Combo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Combo" (
    id integer NOT NULL,
    nombre text NOT NULL,
    precio double precision NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Combo" OWNER TO postgres;

--
-- Name: ComboItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ComboItem" (
    id integer NOT NULL,
    "comboId" integer NOT NULL,
    "productoId" integer NOT NULL,
    "pedidoId" integer,
    cantidad integer NOT NULL
);


ALTER TABLE public."ComboItem" OWNER TO postgres;

--
-- Name: ComboItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ComboItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ComboItem_id_seq" OWNER TO postgres;

--
-- Name: ComboItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ComboItem_id_seq" OWNED BY public."ComboItem".id;


--
-- Name: Combo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Combo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Combo_id_seq" OWNER TO postgres;

--
-- Name: Combo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Combo_id_seq" OWNED BY public."Combo".id;


--
-- Name: ItemPedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ItemPedido" (
    id integer NOT NULL,
    "pedidoId" integer NOT NULL,
    "productoId" integer NOT NULL,
    cantidad integer NOT NULL
);


ALTER TABLE public."ItemPedido" OWNER TO postgres;

--
-- Name: ItemPedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ItemPedido_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ItemPedido_id_seq" OWNER TO postgres;

--
-- Name: ItemPedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ItemPedido_id_seq" OWNED BY public."ItemPedido".id;


--
-- Name: Mesa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Mesa" (
    id integer NOT NULL,
    numero integer NOT NULL
);


ALTER TABLE public."Mesa" OWNER TO postgres;

--
-- Name: Mesa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Mesa_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Mesa_id_seq" OWNER TO postgres;

--
-- Name: Mesa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Mesa_id_seq" OWNED BY public."Mesa".id;


--
-- Name: Pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pedido" (
    id integer NOT NULL,
    estado public."EstadoPedido" NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "mesaId" integer NOT NULL,
    "metodoPago" public."MetodoPago",
    "pagadoEn" timestamp(3) without time zone
);


ALTER TABLE public."Pedido" OWNER TO postgres;

--
-- Name: Pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Pedido_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pedido_id_seq" OWNER TO postgres;

--
-- Name: Pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Pedido_id_seq" OWNED BY public."Pedido".id;


--
-- Name: Producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Producto" (
    id integer NOT NULL,
    nombre text NOT NULL,
    precio double precision NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Producto" OWNER TO postgres;

--
-- Name: Producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Producto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Producto_id_seq" OWNER TO postgres;

--
-- Name: Producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Producto_id_seq" OWNED BY public."Producto".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Combo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Combo" ALTER COLUMN id SET DEFAULT nextval('public."Combo_id_seq"'::regclass);


--
-- Name: ComboItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComboItem" ALTER COLUMN id SET DEFAULT nextval('public."ComboItem_id_seq"'::regclass);


--
-- Name: ItemPedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemPedido" ALTER COLUMN id SET DEFAULT nextval('public."ItemPedido_id_seq"'::regclass);


--
-- Name: Mesa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Mesa" ALTER COLUMN id SET DEFAULT nextval('public."Mesa_id_seq"'::regclass);


--
-- Name: Pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pedido" ALTER COLUMN id SET DEFAULT nextval('public."Pedido_id_seq"'::regclass);


--
-- Name: Producto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Producto" ALTER COLUMN id SET DEFAULT nextval('public."Producto_id_seq"'::regclass);


--
-- Data for Name: Combo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Combo" (id, nombre, precio, activo) FROM stdin;
\.


--
-- Data for Name: ComboItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ComboItem" (id, "comboId", "productoId", "pedidoId", cantidad) FROM stdin;
\.


--
-- Data for Name: ItemPedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ItemPedido" (id, "pedidoId", "productoId", cantidad) FROM stdin;
\.


--
-- Data for Name: Mesa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Mesa" (id, numero) FROM stdin;
1	1
2	2
3	3
4	4
5	5
6	6
7	7
8	8
9	9
10	10
\.


--
-- Data for Name: Pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pedido" (id, estado, creado, "mesaId", "metodoPago", "pagadoEn") FROM stdin;
\.


--
-- Data for Name: Producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Producto" (id, nombre, precio, activo) FROM stdin;
1	Taco de Birria	40	t
2	Combo Tacos	110	t
3	Quesabirria	60	t
4	Combo Quesabirria	160	t
6	Torta Birria	110	t
8	Sope de Birria	40	t
10	Sincronizada D.	110	t
11	Ramen Birria	165	t
12	Omelette con Birria	120	t
13	Huevos con Birria	110	t
15	Only Cheese	90	t
16	1/4 Orden Birria	100	t
17	1/2 Orden Birria	165	t
18	Orden Birria	270	t
19	Orden Familiar	500	t
20	Mini Chio	90	t
21	Queso Lover	130	t
22	El Clasico	110	t
23	Chiosopes	90	t
24	Pareja Sabrosa	250	t
25	Mega Chio	450	t
26	Family Pack	550	t
27	Te Arizona	35	t
28	Coca-Cola lata	35	t
31	Agua Natural	15	t
32	Taco de Frijol Puerco C/Queso	25	t
5	Mini Ramen Birria	100	t
9	Sincronizada S.	75	t
14	Chilaquiles con Birria	150	t
30	Cafe	35	t
29	Agua de sabor	30	t
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
19ab8959-7dc3-4bbb-8ae3-7b8fdf284e56	8fbca43fa13f17632e827e56fe7ebb8f0aca927ca69e477f0ee77f49f57058b0	2026-01-19 23:26:56.348464-08	20260120072656_add_prioridad_pedido	\N	\N	2026-01-19 23:26:56.307177-08	1
f7534021-f16b-4852-a9b0-ea8bf5b0f3ce	e082378fe266ff2e6190bf0e8acffb96590f5c5b518e73e99dde598b158136d5	2026-01-24 14:56:58.90743-08	20260124225658_add_combos	\N	\N	2026-01-24 14:56:58.902987-08	1
00fd5bac-811e-4a3e-9ec0-a784d790c948	faafe4e63283bf1e10b26b2a9ce89f81707d09d83defff447a30c760e058261b	2026-01-29 03:47:24.840091-08	20260129114724_update_pedidos	\N	\N	2026-01-29 03:47:24.803914-08	1
\.


--
-- Name: ComboItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ComboItem_id_seq"', 1, false);


--
-- Name: Combo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Combo_id_seq"', 1, false);


--
-- Name: ItemPedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ItemPedido_id_seq"', 9, true);


--
-- Name: Mesa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Mesa_id_seq"', 10, true);


--
-- Name: Pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pedido_id_seq"', 6, true);


--
-- Name: Producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Producto_id_seq"', 35, true);


--
-- Name: ComboItem ComboItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComboItem"
    ADD CONSTRAINT "ComboItem_pkey" PRIMARY KEY (id);


--
-- Name: Combo Combo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Combo"
    ADD CONSTRAINT "Combo_pkey" PRIMARY KEY (id);


--
-- Name: ItemPedido ItemPedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemPedido"
    ADD CONSTRAINT "ItemPedido_pkey" PRIMARY KEY (id);


--
-- Name: Mesa Mesa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Mesa"
    ADD CONSTRAINT "Mesa_pkey" PRIMARY KEY (id);


--
-- Name: Pedido Pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pedido"
    ADD CONSTRAINT "Pedido_pkey" PRIMARY KEY (id);


--
-- Name: Producto Producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Producto"
    ADD CONSTRAINT "Producto_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ComboItem_comboId_productoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ComboItem_comboId_productoId_key" ON public."ComboItem" USING btree ("comboId", "productoId");


--
-- Name: ItemPedido_pedidoId_productoId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ItemPedido_pedidoId_productoId_key" ON public."ItemPedido" USING btree ("pedidoId", "productoId");


--
-- Name: Mesa_numero_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Mesa_numero_key" ON public."Mesa" USING btree (numero);


--
-- Name: Producto_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Producto_nombre_key" ON public."Producto" USING btree (nombre);


--
-- Name: ComboItem ComboItem_comboId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComboItem"
    ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES public."Combo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ComboItem ComboItem_pedidoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComboItem"
    ADD CONSTRAINT "ComboItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES public."Pedido"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ComboItem ComboItem_productoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ComboItem"
    ADD CONSTRAINT "ComboItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES public."Producto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemPedido ItemPedido_pedidoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemPedido"
    ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES public."Pedido"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemPedido ItemPedido_productoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemPedido"
    ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES public."Producto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pedido Pedido_mesaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pedido"
    ADD CONSTRAINT "Pedido_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES public."Mesa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict cASoQ6dnSOdASOCAEc5X80SPWRyYJEo01Y4AMsAnP3ucQy90QCEYmd3S5JFWgeB

