--
-- PostgreSQL database dump
--

\restrict GxYdA2Z6AwROkGyYbeSbcYkxuDdmzIBekTH2DPGJlcAzBsoq7jgUFlkYbHjqsrB

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    target_table character varying(50),
    target_id integer,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: cpe_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cpe_devices (
    id integer NOT NULL,
    raw_name character varying(255) NOT NULL,
    brand character varying(100),
    model character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cpe_devices OWNER TO postgres;

--
-- Name: cpe_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cpe_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cpe_devices_id_seq OWNER TO postgres;

--
-- Name: cpe_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cpe_devices_id_seq OWNED BY public.cpe_devices.id;


--
-- Name: device_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_catalog (
    id integer NOT NULL,
    brand character varying(100) NOT NULL,
    model character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lan_ge text,
    lan_fe text,
    wifi text,
    type text,
    version text,
    usage text,
    grade text
);


ALTER TABLE public.device_catalog OWNER TO postgres;

--
-- Name: device_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_catalog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.device_catalog_id_seq OWNER TO postgres;

--
-- Name: device_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_catalog_id_seq OWNED BY public.device_catalog.id;


--
-- Name: onu_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onu_records (
    id integer NOT NULL,
    installation_close_date text,
    request_id text,
    circuit_id text,
    province text,
    main_service text,
    speed text,
    price numeric(12,2),
    service_name text,
    promotion_start_date text,
    section text,
    exchange text,
    cpe_brand_model text,
    olt_brand_model text,
    cpe_status text,
    service_status text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.onu_records OWNER TO postgres;

--
-- Name: onu_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.onu_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.onu_records_id_seq OWNER TO postgres;

--
-- Name: onu_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.onu_records_id_seq OWNED BY public.onu_records.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'viewer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wifi_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wifi_mappings (
    id integer NOT NULL,
    raw_brand text NOT NULL,
    raw_model text NOT NULL,
    target_brand text NOT NULL,
    target_model text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wifi_mappings OWNER TO postgres;

--
-- Name: wifi_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wifi_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wifi_mappings_id_seq OWNER TO postgres;

--
-- Name: wifi_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wifi_mappings_id_seq OWNED BY public.wifi_mappings.id;


--
-- Name: wifi_routers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wifi_routers (
    id integer NOT NULL,
    circuit_id text,
    brand text,
    model text,
    version text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wifi_routers OWNER TO postgres;

--
-- Name: wifi_routers_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wifi_routers_backup (
    id integer,
    circuit_id text,
    brand text,
    model text,
    version text,
    created_at timestamp without time zone
);


ALTER TABLE public.wifi_routers_backup OWNER TO postgres;

--
-- Name: wifi_routers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wifi_routers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wifi_routers_id_seq OWNER TO postgres;

--
-- Name: wifi_routers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wifi_routers_id_seq OWNED BY public.wifi_routers.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: cpe_devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cpe_devices ALTER COLUMN id SET DEFAULT nextval('public.cpe_devices_id_seq'::regclass);


--
-- Name: device_catalog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_catalog ALTER COLUMN id SET DEFAULT nextval('public.device_catalog_id_seq'::regclass);


--
-- Name: onu_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onu_records ALTER COLUMN id SET DEFAULT nextval('public.onu_records_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wifi_mappings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wifi_mappings ALTER COLUMN id SET DEFAULT nextval('public.wifi_mappings_id_seq'::regclass);


--
-- Name: wifi_routers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wifi_routers ALTER COLUMN id SET DEFAULT nextval('public.wifi_routers_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: cpe_devices cpe_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cpe_devices
    ADD CONSTRAINT cpe_devices_pkey PRIMARY KEY (id);


--
-- Name: cpe_devices cpe_devices_raw_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cpe_devices
    ADD CONSTRAINT cpe_devices_raw_name_key UNIQUE (raw_name);


--
-- Name: device_catalog device_catalog_brand_model_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_catalog
    ADD CONSTRAINT device_catalog_brand_model_key UNIQUE (brand, model);


--
-- Name: device_catalog device_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_catalog
    ADD CONSTRAINT device_catalog_pkey PRIMARY KEY (id);


--
-- Name: onu_records onu_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onu_records
    ADD CONSTRAINT onu_records_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: wifi_mappings wifi_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wifi_mappings
    ADD CONSTRAINT wifi_mappings_pkey PRIMARY KEY (id);


--
-- Name: wifi_mappings wifi_mappings_raw_brand_raw_model_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wifi_mappings
    ADD CONSTRAINT wifi_mappings_raw_brand_raw_model_key UNIQUE (raw_brand, raw_model);


--
-- Name: wifi_routers wifi_routers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wifi_routers
    ADD CONSTRAINT wifi_routers_pkey PRIMARY KEY (id);


--
-- Name: idx_wifi_circuit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wifi_circuit_id ON public.wifi_routers USING btree (circuit_id);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict GxYdA2Z6AwROkGyYbeSbcYkxuDdmzIBekTH2DPGJlcAzBsoq7jgUFlkYbHjqsrB

