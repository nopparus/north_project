--
-- PostgreSQL database dump
--

\restrict JM33zT6u1a4vuMgYMr1zrmsIyJe7PXxHD4lyXbRP9ZkxIaS7vOSWIY4BXN3ml9E

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    province character varying(100) NOT NULL,
    site_name character varying(255) NOT NULL,
    num_facilities integer DEFAULT 0,
    num_generators integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: maintenance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    work_type character varying(50),
    site_id uuid,
    equipment_type character varying(100),
    date date NOT NULL,
    inspector character varying(255) NOT NULL,
    co_inspector character varying(255),
    status character varying(50),
    data jsonb,
    notes text,
    condition_rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.maintenance_records OWNER TO postgres;

--
-- Name: map_layers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.map_layers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    schema jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.map_layers OWNER TO postgres;

--
-- Name: nt_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nt_locations (
    id integer NOT NULL,
    locationname character varying(255),
    latitude numeric(11,8),
    longitude numeric(11,8),
    servicecenter character varying(255),
    province character varying(255),
    type character varying(50),
    image_url text,
    site_exists boolean,
    site_id integer
);


ALTER TABLE public.nt_locations OWNER TO postgres;

--
-- Name: nt_site_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nt_site_images (
    id integer NOT NULL,
    site_id integer,
    image_url text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nt_site_images OWNER TO postgres;

--
-- Name: nt_site_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nt_site_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nt_site_images_id_seq OWNER TO postgres;

--
-- Name: nt_site_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nt_site_images_id_seq OWNED BY public.nt_site_images.id;


--
-- Name: nt_sites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nt_sites (
    id integer NOT NULL,
    site_name character varying(255),
    latitude numeric(11,8),
    longitude numeric(11,8),
    service_center character varying(255),
    province character varying(255),
    type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    site_exists boolean,
    map_id uuid NOT NULL,
    custom_data jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.nt_sites OWNER TO postgres;

--
-- Name: nt_sites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nt_sites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nt_sites_id_seq OWNER TO postgres;

--
-- Name: nt_sites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nt_sites_id_seq OWNED BY public.nt_sites.id;


--
-- Name: project_site_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_site_records (
    id integer NOT NULL,
    project_id uuid NOT NULL,
    site_id integer NOT NULL,
    custom_data jsonb DEFAULT '{}'::jsonb,
    images jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_site_records OWNER TO postgres;

--
-- Name: project_site_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_site_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_site_records_id_seq OWNER TO postgres;

--
-- Name: project_site_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_site_records_id_seq OWNED BY public.project_site_records.id;


--
-- Name: project_sites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_sites (
    project_id uuid NOT NULL,
    site_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_sites OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    color character varying(20) NOT NULL,
    equipment_types jsonb,
    work_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    filter_config jsonb,
    fields_schema jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: schedule_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    equipment_type character varying(100),
    start_month integer,
    duration integer,
    label character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.schedule_items OWNER TO postgres;

--
-- Name: nt_site_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_site_images ALTER COLUMN id SET DEFAULT nextval('public.nt_site_images_id_seq'::regclass);


--
-- Name: nt_sites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_sites ALTER COLUMN id SET DEFAULT nextval('public.nt_sites_id_seq'::regclass);


--
-- Name: project_site_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_records ALTER COLUMN id SET DEFAULT nextval('public.project_site_records_id_seq'::regclass);


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, province, site_name, num_facilities, num_generators, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_records (id, project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating, created_at) FROM stdin;
\.


--
-- Data for Name: map_layers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.map_layers (id, name, schema, created_at) FROM stdin;
281b4bed-87e0-47a9-a032-22393cdffd52	NT Sites	[]	2026-03-09 04:25:06.714854+00
505e312c-181f-48e8-b8d8-5778df42e0b0	24k	[]	2026-03-09 04:34:27.048689+00
\.


--
-- Data for Name: nt_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nt_locations (id, locationname, latitude, longitude, servicecenter, province, type, image_url, site_exists, site_id) FROM stdin;
\.


--
-- Data for Name: nt_site_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nt_site_images (id, site_id, image_url, uploaded_at) FROM stdin;
182	1100	/api/pms/uploads/CMI_PONO_01__โป่งน้อย__1100_1771580856186-454499256.jpg	2026-03-09 02:15:47.378069
123	2879	/api/pms/uploads/_BigRock_บ้านปงหัวทุ่ง_PHT__2879_1771993346541-926852271.jpg	2026-03-09 01:52:08.425229
124	2901	/api/pms/uploads/_BigRock_บ้านพระบาท_PHB__2901_1771907635904-570033493.jpg	2026-03-09 01:52:08.425229
183	910	/api/pms/uploads/cmi_mlp4_24kolt01__บ้านม้งโหล่งปง_หมู่_4__910_1773022594740-382830680.jpg	2026-03-09 02:16:36.431863
125	2948	/api/pms/uploads/LPG_WPK_01_2948_1771992604138-612505105.jpg	2026-03-09 01:52:08.425229
126	2961	/api/pms/uploads/FTTx_บ้านเสด็จ_2961_1771992507555-438639365.jpg	2026-03-09 01:52:08.425229
127	2962	/api/pms/uploads/FTTx_เถิน_3_2962_1771907173228-747700635.jpg	2026-03-09 01:52:08.425229
128	2964	/api/pms/uploads/LPG_Tha_Tok_2964_1771993241214-328481109.jpg	2026-03-09 01:52:08.425229
1	11	/api/pms/uploads/คณฑี_Calix_11_1772167756049-7695886.jpg	2026-03-09 01:52:08.425229
2	13	/api/pms/uploads/NT1_ท่าพุทรา_13_1772167883997-677919323.jpg	2026-03-09 01:52:08.425229
3	43	/api/pms/uploads/kpt_hjn_24k01_43_1772167687596-702756313.jpg	2026-03-09 01:52:08.425229
4	107	/api/pms/uploads/kpt_ksn_24k01_107_1772167808002-200878205.jpg	2026-03-09 01:52:08.425229
5	115	/api/pms/uploads/kpt_kyi_24k01_115_1772167856370-567717626.jpg	2026-03-09 01:52:08.425229
6	123	/api/pms/uploads/kpt_skn_24k01_123_1772167619126-971298846.jpg	2026-03-09 01:52:08.425229
7	124	/api/pms/uploads/kpt_rsi_24k01_124_1772167842318-284831976.jpg	2026-03-09 01:52:08.425229
8	131	/api/pms/uploads/kpt_ntn_24k01_131_1772167926034-116678373.jpg	2026-03-09 01:52:08.425229
9	217	/api/pms/uploads/KPT_NT2_KTE_คณฑี_D_ER__217_1772167653670-449094598.jpg	2026-03-09 01:52:08.425229
10	229	/api/pms/uploads/KPT_NT2_TMK_ท่ามะเขือ_D_LR__229_1772167938800-933105394.jpg	2026-03-09 01:52:08.425229
11	233	/api/pms/uploads/KPT_NT2_TKO_ท่าตะคร้อ_D_ER__233_1772167712506-463340487.jpg	2026-03-09 01:52:08.425229
12	250	/api/pms/uploads/KPT_NT2_TMR_ธำมรงค์_D_LR__250_1772167770904-716861815.jpg	2026-03-09 01:52:08.425229
13	656	/api/pms/uploads/cri_dknn7_24k01__บ้านดงขนุน_ม__7__656_1771995549385-400023364.jpg	2026-03-09 01:52:08.425229
14	659	/api/pms/uploads/cri_pchg_bigrock_01_โป่งช้าง__659_1771995353802-823246888.jpg	2026-03-09 01:52:08.425229
15	733	/api/pms/uploads/cri_paj10_24k01_บ้านผาจ้อ_ม_10__733_1771995509484-724917784.jpg	2026-03-09 01:52:08.425229
16	737	/api/pms/uploads/cri_djr13_24k01__บ้านดอยเจริญ_ม_13__737_1771995466915-934272463.jpg	2026-03-09 01:52:08.425229
17	738	/api/pms/uploads/cri_hkba6_24k01_ห้วยเครือบ้า__738_1771995387492-287652301.jpg	2026-03-09 01:52:08.425229
18	772	/api/pms/uploads/แม่ลาว_772_1771995612889-303404280.jpg	2026-03-09 01:52:08.425229
19	859	/api/pms/uploads/NT1_หางดง_859_1771578716445-554341632.png	2026-03-09 01:52:08.425229
20	861	/api/pms/uploads/NT1_บ้านกาด_861_1771580100052-242187141.png	2026-03-09 01:52:08.425229
21	883	/api/pms/uploads/NT1_แม่โจ้_883_1771578592179-147556246.png	2026-03-09 01:52:08.425229
22	889	/api/pms/uploads/NT1_แยกสะเมิง_889_1771579626021-844859461.png	2026-03-09 01:52:08.425229
23	1025	/api/pms/uploads/_สันทรายcab_006_1025_1771807824525-649644546.png	2026-03-09 01:52:08.425229
24	1036	/api/pms/uploads/CMI_PAP2_01__ป่าไผ่_ม_2__1036_1771578168095-213534907.png	2026-03-09 01:52:08.425229
25	1039	/api/pms/uploads/CMI_MUKA_01__เหมืองแก้ว__1039_1771578646200-54981914.png	2026-03-09 01:52:08.425229
26	1079	/api/pms/uploads/CMI_DOPI_01__ดอนปิน__1079_1771580400153-114605232.jpg	2026-03-09 01:52:08.425229
27	1081	/api/pms/uploads/CMI_SPHPA_01__รพ_สันป่าตอง__1081_1771579874648-333746277.png	2026-03-09 01:52:08.425229
28	1084	/api/pms/uploads/CMI_SPT_01__สันป่าตอง__1084_1771579347261-944270410.png	2026-03-09 01:52:08.425229
29	1087	/api/pms/uploads/_มะขามหลวง__FTTx__1087_1771579830034-240572028.png	2026-03-09 01:52:08.425229
30	1094	/api/pms/uploads/CMI_TR10_01__ทุ่งรวงทอง_ม_10__1094_1771580048194-588332176.png	2026-03-09 01:52:08.425229
174	1086	/api/pms/uploads/CMI_CAB002_01__เชียงใหม่_1_Cab002__1086_1773022158176-403291642.jpg	2026-03-09 02:09:20.843212
175	1080	/api/pms/uploads/cmi_cmi1_01__เชียงใหม่_1__1080_1773022206323-521982468.jpg	2026-03-09 02:10:07.705699
32	1102	/api/pms/uploads/CMI_BATW_01__บ้านถวาย__1102_1771579548861-584130884.png	2026-03-09 01:52:08.425229
33	1113	/api/pms/uploads/หนองตอง_ม_9_1113_1771579199239-48010305.png	2026-03-09 01:52:08.425229
184	1095	/api/pms/uploads/น้ำซุ้ม_NSUM_1095_1773025283187-9686347.jpg	2026-03-09 03:01:25.847687
34	1117	/api/pms/uploads/cmi_stw_01__สันทรายมหาวงศ์__1117_1771578834801-902450234.png	2026-03-09 01:52:08.425229
35	1128	/api/pms/uploads/CMI_TSTK_01__ทุ่งสะโตก__1128_1771580151001-494623165.png	2026-03-09 01:52:08.425229
36	1130	/api/pms/uploads/CMI_WPE_01__ขังมุง_ป่าเดื่อ__1130_1771579398020-54738626.png	2026-03-09 01:52:08.425229
37	1131	/api/pms/uploads/CMI_KOVI_01__กุลพันธ์วิลล์_9__1131_1771579485568-598501968.png	2026-03-09 01:52:08.425229
39	1565	/api/pms/uploads/NAN_GPON_FH_Office_NT1_1565_1772161859718-883928646.jpg	2026-03-09 01:52:08.425229
38	1565	/api/pms/uploads/NAN_GPON_FH_Office_NT1_1565_1772162117981-792937930.jpg	2026-03-09 01:52:08.425229
40	1566	/api/pms/uploads/NAN_GPON_FH_SuanTan_NT1_1566_1772162161773-590357019.jpg	2026-03-09 01:52:08.425229
41	1569	/api/pms/uploads/NAN_GPON_FH_Pupaing_NT1_1569_1772162862350-639842565.jpg	2026-03-09 01:52:08.425229
42	1570	/api/pms/uploads/NAN_GPON_FH_Dutai_NT1_1570_1772162363039-243679833.jpg	2026-03-09 01:52:08.425229
43	1624	/api/pms/uploads/nan_ttg_zte01_ถึมตอง_1624_1772162333722-676931821.jpg	2026-03-09 01:52:08.425229
44	1629	/api/pms/uploads/nan_bcp_zte01_แช่พลาง_1629_1772163300839-69269491.jpg	2026-03-09 01:52:08.425229
45	1630	/api/pms/uploads/nan_bmj_zte01_เมืองจัง_1630_1772161678484-639848057.jpg	2026-03-09 01:52:08.425229
46	1642	/api/pms/uploads/nan_str_zte01_บ้านสถารศ_1642_1772161749734-373675902.jpg	2026-03-09 01:52:08.425229
47	1645	/api/pms/uploads/nan_btn_zte01_บ้านทุ่งน้อย_1645_1772161732310-332076398.jpg	2026-03-09 01:52:08.425229
48	1647	/api/pms/uploads/nan_bpk_zte01_บ้านปางค่า_1647_1772162409802-998233607.jpg	2026-03-09 01:52:08.425229
49	1649	/api/pms/uploads/nan_bmkt_zte01_บ้านมงคลนิมิตร_1649_1772162139260-751677860.jpg	2026-03-09 01:52:08.425229
50	1658	/api/pms/uploads/nan_ngc_zte02_ศ_ราชการใหม่_1658_1772162312016-44961045.jpg	2026-03-09 01:52:08.425229
51	1670	/api/pms/uploads/nan_nan_zte01_น่าน_1670_1772162201541-37700936.jpg	2026-03-09 01:52:08.425229
52	1671	/api/pms/uploads/nan_dti_zte01_ส่วนบริการลูกค้าดู่ใต้_1671_1772162461427-160822500.jpg	2026-03-09 01:52:08.425229
138	3103	/api/pms/uploads/Lotus_PaSang_3103_1771579330555-123195729.png	2026-03-09 01:52:08.425229
53	1692	/api/pms/uploads/NT1__PYO_FH_ศูนย์_NT_พะเยา2_1692_1772164062585-698135397.jpg	2026-03-09 01:52:08.425229
54	1695	/api/pms/uploads/NT1__PYO_FH_ท่าวังทอง_1695_1772163989536-775412186.jpg	2026-03-09 01:52:08.425229
55	1714	/api/pms/uploads/BigRock_ค้างหงษ์_1714_1771995248462-261690996.jpg	2026-03-09 01:52:08.425229
56	1715	/api/pms/uploads/BigRock_ธาตุขิงแกง_1715_1771995232698-891188946.jpg	2026-03-09 01:52:08.425229
57	1722	/api/pms/uploads/BigRock_รพ_สต_น้ำปุก_1722_1771995094352-870185799.jpg	2026-03-09 01:52:08.425229
58	1732	/api/pms/uploads/บ้านสร้อยศรี_1732_1771995267946-994132202.jpg	2026-03-09 01:52:08.425229
59	1740	/api/pms/uploads/บ้านเลี้ยว_1740_1771995115077-834394305.jpg	2026-03-09 01:52:08.425229
60	1747	/api/pms/uploads/บ้านห้วยแม่แดง_1747_1771995058019-901608650.jpg	2026-03-09 01:52:08.425229
61	1748	/api/pms/uploads/บ้านแม่วังช้าง_1748_1771995074905-709062443.jpg	2026-03-09 01:52:08.425229
62	1749	/api/pms/uploads/บ้านธาตุสันทุ่งใต้_1749_1771995211592-533703865.jpg	2026-03-09 01:52:08.425229
63	1775	/api/pms/uploads/บ้านสานไซงาม_1775_1772163954184-344757442.jpg	2026-03-09 01:52:08.425229
64	1777	/api/pms/uploads/ห้วยบงเหนือ_1777_1772164192401-826909540.jpg	2026-03-09 01:52:08.425229
65	1809	/api/pms/uploads/บ้านต้ำกลางAIS_1809_1772163914534-251347216.jpg	2026-03-09 01:52:08.425229
66	1813	/api/pms/uploads/บ้านสัน_1813_1772164095749-974682755.jpg	2026-03-09 01:52:08.425229
67	1815	/api/pms/uploads/บ้านห้วยทรายคำ_1815_1772164140844-839588486.jpg	2026-03-09 01:52:08.425229
68	1825	/api/pms/uploads/บ้านใหม่_FTTx_1825_1772164115395-624560813.jpg	2026-03-09 01:52:08.425229
69	1828	/api/pms/uploads/PYO_CAB_014__1828_1772163612612-71285203.jpg	2026-03-09 01:52:08.425229
70	2193	/api/pms/uploads/NT1_XGPON___พลายชุมพล_2193_1772165676913-253270966.jpg	2026-03-09 01:52:08.425229
71	2199	/api/pms/uploads/NT1_สนง_พิษณุโลก__ริมน้ำ__2199_1772165706352-741059871.jpg	2026-03-09 01:52:08.425229
72	2200	/api/pms/uploads/NT1_บิ๊กซี_โคกช้าง_2200_1772165946937-784544022.jpg	2026-03-09 01:52:08.425229
73	2221	/api/pms/uploads/plk_pcp_24k04_บ้านตาลสุวรรณ_2221_1772166001750-216722742.jpg	2026-03-09 01:52:08.425229
74	2245	/api/pms/uploads/_BigRock_บ้านวังมะด่าน_2245_1772165695409-248649064.jpg	2026-03-09 01:52:08.425229
75	2253	/api/pms/uploads/plk_sak_24k04_บ้านสะอัก_อินโดจีน_2253_1772165987788-873306414.jpg	2026-03-09 01:52:08.425229
76	2257	/api/pms/uploads/plk_bnp_24k06_บ้านหนองปลิง_พลายชุมพล_2257_1772165466718-625066811.jpg	2026-03-09 01:52:08.425229
77	2342	/api/pms/uploads/USO_644_บ้านร่มเกล้า_2342_1771994059954-909710400.jpg	2026-03-09 01:52:08.425229
78	2363	/api/pms/uploads/NT2_วิทยาลัยพาณิชยการบึงพระ_2363_1772165361120-298192268.jpg	2026-03-09 01:52:08.425229
79	2385	/api/pms/uploads/NT2_หมู่บ้านชินลาภ_2385_1772165632187-381824921.jpg	2026-03-09 01:52:08.425229
80	2386	/api/pms/uploads/NT2_ราชภัฏพิบูลสงคราม_ทะเลแก้ว__2386_1772165593852-314129082.jpg	2026-03-09 01:52:08.425229
81	2393	/api/pms/uploads/NT2_ตชด_31_ค่ายเจ้าพระยาจักรี__2393_1772165651318-974678546.jpg	2026-03-09 01:52:08.425229
82	2398	/api/pms/uploads/NT2_สองแคววิลล่า_2398_1772165778515-446030168.jpg	2026-03-09 01:52:08.425229
83	2399	/api/pms/uploads/NT2_ธรรมบูชา_ซอย_1__ก่อนถึงแยกซอยขุนหาญ_CAB_013__2399_1772165933001-236256606.jpg	2026-03-09 01:52:08.425229
84	2400	/api/pms/uploads/NT2_แยกแสงดาว__หมู่บ้านคุ้มเพชรวรินทร์__2400_1772165619326-654721897.jpg	2026-03-09 01:52:08.425229
85	2409	/api/pms/uploads/NT2_พระองค์ขาว_ซอย_5__หลัง_ส_สนุกเกอร์__2409_1772165734604-266097399.jpg	2026-03-09 01:52:08.425229
86	2412	/api/pms/uploads/NT2_บ้านหัวรอ_ม_3_2412_1772166060635-575270234.jpg	2026-03-09 01:52:08.425229
87	2413	/api/pms/uploads/์NT2_วัดอรัญญิก_CAB_16__สามแยก_7_11__2413_1772165762473-40621513.jpg	2026-03-09 01:52:08.425229
88	2414	/api/pms/uploads/NT2_อบจ__พิษณุโลก_2414_1772165567551-627296006.jpg	2026-03-09 01:52:08.425229
89	2425	/api/pms/uploads/NT2_วัดน้อย_2425_1772165795320-788293683.jpg	2026-03-09 01:52:08.425229
90	2428	/api/pms/uploads/NT2_สุรสีห์_2428_1772165861825-887893599.jpg	2026-03-09 01:52:08.425229
91	2429	/api/pms/uploads/เขื่อนขันธ์_2429_1772165882923-522513829.jpg	2026-03-09 01:52:08.425229
92	2432	/api/pms/uploads/XGsPON_โคกมะตูม_2432_1772165895486-717918493.jpg	2026-03-09 01:52:08.425229
93	2440	/api/pms/uploads/XGsPON_พลายชุมพล_2440_1772165544808-290516573.jpg	2026-03-09 01:52:08.425229
94	2610	/api/pms/uploads/NT1_แม่ถาง_2610_1771992799061-940308255.jpg	2026-03-09 01:52:08.425229
95	2632	/api/pms/uploads/pre_bpkp_24k01_ปากปาน_ม_1__2632_1771992944379-899094716.jpg	2026-03-09 01:52:08.425229
96	2649	/api/pms/uploads/pre_bph_24k01_บ้านปากห้วย__2649_1771992658072-211922347.jpg	2026-03-09 01:52:08.425229
97	2682	/api/pms/uploads/NT2_หัวฝาย_ม_5_2682_1771993598858-845409319.jpg	2026-03-09 01:52:08.425229
98	2703	/api/pms/uploads/NT1_สถานีทวนสัญญาณดอยกิ่วลม_ปางมะผ้า_ms_klms_ol_f554_1_2703_1771992155813-729229885.jpg	2026-03-09 01:52:08.425229
99	2708	/api/pms/uploads/NT1_บ้านแม่เหาะ_ms_mhou_ol_f554_1_2708_1772167067576-272391692.jpg	2026-03-09 01:52:08.425229
100	2710	/api/pms/uploads/NT1_MHS_MAE_HONG_SON_FTTx__GPON_FH_Office_2710_1772167466159-478892926.jpg	2026-03-09 01:52:08.425229
101	2712	/api/pms/uploads/NT1_MHS_GPON_FH_Khunyum_2712_1772166828106-159631088.jpg	2026-03-09 01:52:08.425229
102	2715	/api/pms/uploads/NT1_บ้านม่วงสร้อย_ms_msyd_ol_f554_1_2715_1771992010421-842946452.jpg	2026-03-09 01:52:08.425229
103	2721	/api/pms/uploads/msn_kym_24k02_2721_1772166798424-143495023.jpg	2026-03-09 01:52:08.425229
104	2723	/api/pms/uploads/msn_msrr_24k03_2723_1772167090625-987855719.jpg	2026-03-09 01:52:08.425229
105	2739	/api/pms/uploads/Big_Rock_บ้านแม่เหาะ_2739_1772167027726-854830338.jpg	2026-03-09 01:52:08.425229
106	2746	/api/pms/uploads/msn_pmp_bigrock_02_2746_1771992250877-836404044.jpg	2026-03-09 01:52:08.425229
107	2757	/api/pms/uploads/Big_Rock_บ้านเมืองปอน_2757_1771992334304-26448299.jpg	2026-03-09 01:52:08.425229
109	2773	/api/pms/uploads/การประปา_2_2773_1772167499443-12782428.jpg	2026-03-09 01:52:08.425229
112	2775	/api/pms/uploads/ปาย__FTTx__2775_1771992133363-796561057.jpg	2026-03-09 01:52:08.425229
113	2776	/api/pms/uploads/ขุนยวม_2776_1772166858382-697060554.jpg	2026-03-09 01:52:08.425229
114	2778	/api/pms/uploads/HUAI_SING_FTTx__2778_1771992456332-320266587.jpg	2026-03-09 01:52:08.425229
116	2783	/api/pms/uploads/__บ้านปางเกี๊ยะ_หมู่_11__2783_1772166890363-971930669.jpg	2026-03-09 01:52:08.425229
117	2789	/api/pms/uploads/บ้านท่าผาปุ้ม_2789_1772167001625-746914740.jpg	2026-03-09 01:52:08.425229
118	2792	/api/pms/uploads/MAESARING_CAB_5__2792_1771992425593-557084008.jpg	2026-03-09 01:52:08.425229
177	2782	/api/pms/uploads/ศูนย์บริการลูกค้า_NT_2782_1772167183779-619376761.jpg	2026-03-09 02:11:21.000035
178	2799	/api/pms/uploads/สบป่อง_2799_1772167214019-893013330.jpg	2026-03-09 02:11:26.097457
179	2770	/api/pms/uploads/FM_Redio_104MHz_2770_1772167237365-608596430.jpg	2026-03-09 02:11:31.011458
181	2774	/api/pms/uploads/แม่ฮ่องสอน__FTTx__2774_1772167472985-745600359.jpg	2026-03-09 02:11:39.778087
180	2774	/api/pms/uploads/แม่ฮ่องสอน__FTTx__2774_1772167260319-899538350.jpg	2026-03-09 02:11:39.777497
121	2827	/api/pms/uploads/NT1_LPG_GPON_FH_Office_2_NT1_2827_1771992545756-829411144.jpg	2026-03-09 01:52:08.425229
122	2832	/api/pms/uploads/NT1_lp_mpks_ol_f554_1_2832_1771907263339-106594806.jpg	2026-03-09 01:52:08.425229
129	2994	/api/pms/uploads/NT1_ริมปิง_2994_1771579018663-568296261.png	2026-03-09 01:52:08.425229
130	3007	/api/pms/uploads/lpn_pako_24k01_บ้านปากล้อง_ม_9__3007_1771578858371-515907466.png	2026-03-09 01:52:08.425229
131	3038	/api/pms/uploads/lpn_hpc_24k01_ห้วยปู่เจ็ก__3038_1771903534369-595280526.jpg	2026-03-09 01:52:08.425229
132	3040	/api/pms/uploads/lpn_hubo_24k01_บ้านห้วยบง__3040_1771903606609-294317972.jpg	2026-03-09 01:52:08.425229
133	3049	/api/pms/uploads/แม่ตืน_3049_1771904462048-522224586.jpg	2026-03-09 01:52:08.425229
134	3059	/api/pms/uploads/_อุโมงค์_3059_1771815675183-795151443.jpg	2026-03-09 01:52:08.425229
135	3072	/api/pms/uploads/เจดีย์ขาว_ริมปิง_ม_5__3072_1771578736644-731323984.png	2026-03-09 01:52:08.425229
136	3074	/api/pms/uploads/_ปากบ่อง_ม_4_3074_1771907485033-55699666.jpg	2026-03-09 01:52:08.425229
137	3096	/api/pms/uploads/WangDin_3096_1771906445051-588190464.jpg	2026-03-09 01:52:08.425229
139	3105	/api/pms/uploads/LPN__กองงาม_3105_1771579025647-46812278.png	2026-03-09 01:52:08.425229
140	3107	/api/pms/uploads/MaeTeoy_3107_1771904635630-240128656.jpg	2026-03-09 01:52:08.425229
141	3108	/api/pms/uploads/SanPaSak_M_5_3108_1771904564660-567171261.jpg	2026-03-09 01:52:08.425229
142	3120	/api/pms/uploads/PaSangNoi__ป่าซางน้อย___3120_1771579288161-746303833.png	2026-03-09 01:52:08.425229
143	3126	/api/pms/uploads/MaeTongRew__แม่ทองริ้ว___3126_1771579127334-991593915.png	2026-03-09 01:52:08.425229
144	3128	/api/pms/uploads/BanPaBuk__บ้านป่าบุก___3128_1771579088367-314483498.png	2026-03-09 01:52:08.425229
145	3150	/api/pms/uploads/_ฮ่องแล้ง___BAN_HONG_LAENG___3150_1771578872911-371300487.png	2026-03-09 01:52:08.425229
146	3184	/api/pms/uploads/PraTadHaDuang__พระธาตห้าดวง___3184_1771906468506-679848674.jpg	2026-03-09 01:52:08.425229
147	3189	/api/pms/uploads/NT1_ศรีนคร2_FBH_3189_1772164711676-917663974.jpg	2026-03-09 01:52:08.425229
148	3193	/api/pms/uploads/NT1_บ้านสารจิตร_FBH_3193_1772164972521-437077928.jpg	2026-03-09 01:52:08.425229
149	3200	/api/pms/uploads/NT1_สวรรคโลก2_FBH_3200_1772164536682-934794775.jpg	2026-03-09 01:52:08.425229
150	3242	/api/pms/uploads/sti_slk_24k01สวรรคโลก_3242_1772164515014-126755048.jpg	2026-03-09 01:52:08.425229
151	3243	/api/pms/uploads/sti_ntu_24k01นาทุ่ง_3243_1772164393567-645331914.jpg	2026-03-09 01:52:08.425229
153	3252	/api/pms/uploads/sti_ngb4_24k01หนองบัว_ม_4_3252_1772165036419-869992442.jpg	2026-03-09 01:52:08.425229
152	3252	/api/pms/uploads/sti_ngb4_24k01หนองบัว_ม_4_3252_1772165323336-619277894.jpg	2026-03-09 01:52:08.425229
154	3254	/api/pms/uploads/sti_bmcm_24k01บ้านใหม่ชัยมงคล_3254_1772164234631-1896548.jpg	2026-03-09 01:52:08.425229
155	3265	/api/pms/uploads/sti_ssr_USO671คลองสะเกษ_3265_1772164432109-418891086.jpg	2026-03-09 01:52:08.425229
156	3280	/api/pms/uploads/NT_สวรรคโลก_วัดสวัสติการาม__3280_1772164479194-135993710.jpg	2026-03-09 01:52:08.425229
157	3287	/api/pms/uploads/NT_ป่ากุมเกาะ_ม_3_3287_1772164947446-576426564.jpg	2026-03-09 01:52:08.425229
158	3293	/api/pms/uploads/NT_คลองยาง_ม_4_สวรรคโลก__3293_1772164667701-373726435.jpg	2026-03-09 01:52:08.425229
159	3297	/api/pms/uploads/NT_หนองเรียง_3297_1772164760647-462538452.jpg	2026-03-09 01:52:08.425229
160	3298	/api/pms/uploads/NT_บ้านแก่ง_ม_9_3298_1772165009045-246681900.jpg	2026-03-09 01:52:08.425229
161	3305	/api/pms/uploads/NT_ท่าทอง2_3305_1772164370650-812511803.jpg	2026-03-09 01:52:08.425229
162	3331	/api/pms/uploads/utt_brc_24k03_ผาเลือด_หมู่9__3331_1771994130193-547230624.jpg	2026-03-09 01:52:08.425229
163	3345	/api/pms/uploads/utt_utt_24k04_ข่อยสูง_หมู่_8__3345_1772164803832-445392243.jpg	2026-03-09 01:52:08.425229
164	3349	/api/pms/uploads/utt_hast_24k04_บ้านปากสิงห์_หมู่_6__3349_1771994159793-626940068.jpg	2026-03-09 01:52:08.425229
165	3351	/api/pms/uploads/utt_hast_24k06_แสนตอ_หมู่_2__3351_1771994181318-163244846.jpg	2026-03-09 01:52:08.425229
166	3353	/api/pms/uploads/utt_hast_24k08_บ้านวังถ้ำหมู่_3__3353_1771994937621-200972525.jpg	2026-03-09 01:52:08.425229
167	3371	/api/pms/uploads/utt_brc_USO715_บ้านน้ำพร้า_ม_1__3371_1771993750376-752652998.jpg	2026-03-09 01:52:08.425229
168	3378	/api/pms/uploads/NT_นายาง_ม_4_3378_1772164863667-605389550.jpg	2026-03-09 01:52:08.425229
169	3397	/api/pms/uploads/NT_ทองแสนขัน_3397_1771995023085-701887770.jpg	2026-03-09 01:52:08.425229
170	3410	/api/pms/uploads/NT_บุ่งจิก_3410_1771995002635-866114471.jpg	2026-03-09 01:52:08.425229
171	3413	/api/pms/uploads/NT_ผาเลือด_3413_1771994101466-333010851.jpg	2026-03-09 01:52:08.425229
173	1053	/api/pms/uploads/CMI_CMI1CAB017_01__เชียงใหม่_1_Cab_017_วังสิงห์คำ__1053_1773021978589-674520191.jpg	2026-03-09 02:06:21.779712
172	1044	/api/pms/uploads/CMI_CMI2_03__เชียงใหม่_2_3__1044_1773021907674-703245222.jpg	2026-03-09 02:05:13.862083
176	2797	/api/pms/uploads/ท่าโป่งแดง_2797_1772167157479-721772910.jpg	2026-03-09 02:11:15.483059
\.


--
-- Data for Name: nt_sites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nt_sites (id, site_name, latitude, longitude, service_center, province, type, created_at, site_exists, map_id, custom_data) FROM stdin;
1100	CMI_PONO_01_(โป่งน้อย)	18.76942032	98.94536053	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2867	lpg-msn-24k01 บ้านสบเมาะ(ชส.สบป้าด ม.4)	18.25970759	99.70952894	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2868	lpg-mng-24k01 บ้านแม่งอน(ชส.งาว(บ้านแหง))	18.76044521	100.00252884	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2869	lpg-tdm-24k01 บ้านแท่นดอกไม้(ชส.เถินบุรี ม.2)	17.60592765	99.18660089	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2870	lpg-tuk-24k01 บ้านทุ่งข่วง(ชส.บ้านค่า ม.5)	18.52167827	99.47689768	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2871	lpg-tuf-24k01 ม.6 บ้านทุ่งฝาง(ชส.บ้านทุ่งฝาง หมู่ 6)	18.48021205	99.47063755	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2872	lpg-pon-24k01บ้านปงเหนือ(ชส.ห้างฉัตร_บ้านปงใต้)	18.27163093	99.38071522	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2873	lpg-spn-24k01_สวนป่าหนองปง(ชส.บ้านสบมาย ม.2)	18.51360596	99.64295433	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2874	lpg-huk-24k01 บ้านห้วยคิง(ชส.แม่เมาะ ม.8)	18.28779808	99.67445067	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2875	lpg-dnp-24k01 บ้านเด่นนภา(ชส.สมัย ม.2)	17.90268808	99.39501839	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2876	lpg-hur-24k01 บ้านห้วยเรียน(ชส.ห้วยเรียน)	18.36782300	99.29868700	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2877	lpg-hmk-24k01 บ้านห้วยมะเกลือ(ชส.หัวเสือ ม.4)	18.14739801	99.67201900	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2878	-BigRock บ้านนาแช่(NCH)	18.39254923	99.85773388	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2879	-BigRock บ้านปงหัวทุ่ง(PHT)	18.11134840	99.20716946	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2880	-BigRock บ้านไผ่แพะ(PIP)	18.61539458	99.63033567	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2881	-BigRock บ้านใหม่พัฒนา(MPT)	19.03615900	99.78428200	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2882	-BigRock บ้านห้วยน๊อต(HUN)	18.73222900	99.85340800	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2883	-BigRock บ้านหวด(HUT)	18.68382803	99.93993779	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2884	หมู่ 6 บ้านสันติสุข	18.86095719	99.84484040	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2885	หมู่ 2 บ้านตึงเหนือ	19.04770281	99.70946950	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2886	-BigRock บ้านหนองกอก(NGK)	18.84900198	99.56695429	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2887	-BigRock บ้านช่อฟ้า(CHF)	18.86422883	99.72687511	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2888	-BigRock บ้านปางอ้า(PGA)	17.43752076	99.37068290	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2889	-BigRock บ้านท่าเกวียน(TAK)	17.34756142	99.43710841	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2890	-BigRock บ้านกลาง(KLN)	18.56144746	99.75318361	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2891	-BigRock บ้านแม่ถอด(MTH)	17.74982595	99.23351601	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2892	-BigRock บ้านท่ามะเกว๋น(TMK)	17.64856800	99.27783500	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2893	-BigRock บ้านหัวเมือง(HUM)	19.00421700	99.51961500	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2894	-BigRock บ้านเอื้อม(UEM)	18.39634930	99.45353549	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2895	-BigRock บ้านแม่ต๋ำ(MTM)	17.93573701	99.15141518	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2896	หมู่ 4 บ้านทาน	18.44232917	99.93669894	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2897	-BigRock บ้านใหม่(MAI)	18.13527018	99.61876242	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2898	-BigRock บ้านฮ่องห้า(HGH)	18.16963353	99.49404881	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2899	-BigRock บ้านวังผู(WPU)	17.49717262	99.12729431	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2900	-BigRock บ้านห้วยขี้นก(HKN)	17.52667526	98.99613709	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2901	-BigRock บ้านพระบาท(PHB)	17.44457989	99.15580432	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2902	lpg-lkn-24k01 บ้านหลิ่งก้าน(ชส.หนองหล่ม ม.6)	18.33153603	99.41236328	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2903	-BigRock บ้านป่าแหน่ง(PNE)	19.26243587	99.64027617	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2904	-BigRock บ้านสบเรียง(SPR)	17.86896619	99.33109905	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2905	-BigRock บ้านหลิ่งก้าน2(LKN2)	18.34802420	99.38842300	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2906	-BigRock บ้านเด่น(DEN)	18.02847400	99.49013200	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2907	lpg-man-24k01 แม่อางน้ำล้อม(ชส.ศรีปรีดา)	18.45258400	99.63495400	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2908	lpg-tnt-24k01 บ้านต้นต้อง(ชส.บ้านต้นต้อง หมู่ 5)	18.34095000	99.54337000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2909	lpg-thp-24k01 บ้านท่าโป่ง(ชส.เสริมซ้าย)	18.01203400	99.19834400	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2910	lpg-npn7-24k01 นิคมเขต7(ติดชส.นิคมพัฒนา ม.1)	18.41499400	99.54331700	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2911	lpg-pok-24k01 บ้านโป่งแก้ว(ชส.บ้านโป่ง ม.9)	18.71262500	99.95726400	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2912	lpg-phm-24k01 บ้านแพะใหม่(ชส.วังเงิน)	18.11706625	99.62662320	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
910	cmi-mlp4-24kolt01 (บ้านม้งโหล่งปง หมู่ 4)	18.34615123	98.36984055	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2913	lpg-pmo-24k01 บ้านปางมะโอ(ชส.บ้านปางมะโอ)	18.05585208	99.67417282	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2914	lpg-nab-24k01 บ้านนาบง(ชส.ดอนไฟ ม.2)	18.11618445	99.65288133	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2915	lpg-cka-24k01 บ้านจำค่า	18.42076430	99.66528830	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2916	lpg-lsp-24k01 บ้านล้อมศรีป้อ(ชส.ลำปางหลวง)	18.21602693	99.38976877	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2917	lpg-sdc-24k01 บ้านศรีดอนไชย(ชส.ต้นธงชัย ม.6)	18.36135249	99.52786888	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2918	lpg-npn3-24k01 นิคมพัฒนาเขต3(ชส.ทุ่งฝาย)	18.41220300	99.54436100	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2919	lpg-wnt-24k01 วังน้ำต้อง(ชส.นาสัก ม.3)	18.30854067	99.83915874	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2920	lpg-sop-24k01 บ้านสบไพร(ชส.บ้านเป้า)	18.33570000	99.43954000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2921	lpg-yao-24k01 บ้านยางอ้อยใต้(ชส.บ้านยางอ้อยใต้ ม.11)	18.31366500	99.33578700	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2922	lpg-nbo-24k01 บ้านนาบัว(ชส.เมืองยาว)	18.26075686	99.24812203	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2923	lpg-smj-24k01 สวนป่าแม่จาง(ชส.สบป้าด ม.3)	18.26588174	99.76206310	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2924	lpg-tpn-24k01 บ้านทุ่งพัฒนา(ชส.ทุ่งฮั้ว ม.11)	19.23029356	99.63362542	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2925	lpg-mtn-24k01 แม่ตาใน(ชส.ปงดอน ม.1)	18.75808129	99.61887173	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2926	lpg-msk-24k01 บ้านใหม่สามัคคี(ชส.แม่สุก ม.6)	18.79300301	99.57694169	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2927	lpg-tut-24k01 บ้านทุ่งตุ้น(ชส.วังใต้ ม.1)	19.06571362	99.61571392	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2928	lpg-pak-24k01 บ้านป่าแขม(ชส.วังซ้าย ม.5)	19.17178081	99.64380671	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2929	lpg-pgt-24k01_ บ้านปงทอง(ชส.วังทอง ม.7)(ติดถนนซ้ายมือ)	19.11030803	99.68943856	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2933	lpg_hct_fttx_02	18.32835000	99.36595900	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2934	FTTx_sirirat	18.02527300	99.48536710	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2935	FTTx_maetaloung	18.17866029	99.55502973	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2936	LPG_นาก่วมเหนือ	18.27292980	99.47146816	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2937	MaeTa_FTTx	18.12860691	99.50901140	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2938	BAN_Ueam_M_3	18.44058094	99.43588470	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2939	แม่กั๊วะ	17.94580028	99.34826635	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2940	LPG_กล้วยแพะ	18.20558997	99.48834535	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2941	ลำปาง 1 (FTTx)	18.29051613	99.48541570	NT2	ลำปาง	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2942	lpg_cpu_xgs	18.24245732	99.44760732	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2943	สันติสุข (ลำปาง)	18.31391808	99.52848320	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2944	ราชภัฎลำปาง	18.23901173	99.49211854	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2945	LPG_WAC_01	18.28120214	99.51210378	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2946	LPG_SPP_01	17.87943592	99.33271458	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2947	LPG_BOH_01	18.29868124	99.47829125	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2948	LPG_WPK_01	18.30011430	99.50889617	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2949	numtong	18.30759238	99.46863514	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2950	เวียงมอก	17.49454187	99.35359312	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2951	Napong	17.64892256	99.16448735	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2952	RongKor	18.99032333	99.61612092	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2953	FTTx_บ้านทุ่งเกวียน	18.32624904	99.28322810	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2954	FTTx_นายาง	17.90972300	99.30964522	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2955	USO-mae-teep	18.61096127	100.03257133	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2956	USO-pieng-jai	18.81430382	99.71325572	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2957	USO-kum-nung	17.59851595	99.33295610	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2958	LPG-FTTx-GOV ศูนย์ราชการ	18.25657753	99.54494552	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2959	-USO บ้านป่าเหมี้ยง (PAM)	18.82472000	99.38674800	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2960	-USO บ้านไร่(RAI)	18.89226000	99.53346000	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2961	FTTx_บ้านเสด็จ	18.38829095	99.59708120	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2962	FTTx_เถิน 3	17.62922505	99.22744435	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2963	PUNNEE_PONGW	18.36303300	99.57760900	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2964	LPG_Tha-Tok	18.36005700	99.55030458	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2965	khaewng kan tang (cab#20)	18.27703226	99.47583105	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2966	เกาะคา_บ้านท่าผา	18.19109675	99.39541447	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2967	LPG_FTTx_banfon	18.24355721	99.43270396	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
4	บึงสามัคคี	16.14868000	99.93571000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
5	ขาณุวรลักษบุรี	16.07201000	99.85717000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
6	วังแขม	16.17295000	99.79519000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
7	หนองแดน	16.52124100	99.22936400	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
8	โกสัมพี(วังเจ้า)	16.67182000	99.27760200	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
9	โนนสมบูรณ์	16.63313900	99.35014700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
10	คลองขลุง	16.21415000	99.70455000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
11	คณฑี Calix	16.35000000	99.66000000	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
12	หัวถนน	16.25886200	99.60557800	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
13	NT1_ท่าพุทรา	16.26593000	99.68573600	NT1	กำแพงเพชร	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
14	ปางมะค่า	15.90887700	99.45620500	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
15	Sisomboom	15.92706500	99.42284500	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
16	สลกบาตร NT2	15.99169000	99.79962000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
17	NT1_พรานกระต่าย_calix	16.66370000	99.58629000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
18	NT1_ท่าไม้ 1_calix	16.72248295	99.45750520	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
19	NT1_บางลาด_calix	16.77121427	99.57892161	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
20	NT1_สค.กำแพงเพชร1_calix	16.47310000	99.50562000	NT1	กำแพงเพชร	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
21	NT1_ไตรตรึงษ์_calix	16.36175000	99.56805400	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
22	NT1_ศูนย์ราชการ ชั้น 1_calix	16.55472000	99.51112700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
23	NT1_เกาะรากเสียด_calix	16.60585000	99.39672400	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
24	NT1_นิคมทุ่งโพธิ์ทะเล_calix	16.49142000	99.68880300	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
25	NT1_คลองไพร_calix	16.38221000	99.33048800	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
26	NT1_หนองปลิง_calix	16.51758000	99.50110600	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
27	NT1_บ้านใหม่_calix	16.45133000	99.45810000	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
28	NT1_ทรงธรรม_calix	16.51215000	99.44227600	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
29	KPT_NT1_KNJ_เกาะน้ำโจน_D[ER]	16.64265000	99.39624300	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
30	KPT_NT1_KLNA_เขาลับงา_D[ER]	16.44011000	99.42387600	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
31	ลานกระบือ	16.60326000	99.85171000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
32	เกศกาษร	16.56339100	99.91860700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
33	บ้านหนองโสน	16.55054300	99.72987300	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
34	หนองแขม	16.69579400	99.73536800	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
35	ท่าขึ้น	16.12654500	99.56153700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
36	ปางศิลาทอง	16.10900700	99.50635700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
37	วังหามแห	16.08525300	99.63175400	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
38	วังน้ำพุ	16.10854300	99.58477700	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
39	คลองลาน Calix	16.14848483	99.32767098	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
40	วังตะเคียน กำแพงเพชร	16.18749500	99.42781600	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
41	KPT_NT1_PTW_ปางตาไว_D[ER]	16.02273000	99.36808100	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
42	มอมะนาว	16.32792000	99.40653000	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
43	kpt-hjn-24k01	16.37291485	99.71404076	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
44	kpt-ndg-24k01	16.68845181	99.64931231	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
45	kpt-kpi-24k03	16.10661908	99.71917438	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
46	kpt-bkm-24k01	15.91050744	99.66371484	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
47	kpt-psg-24k01	15.95031704	99.75977248	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
48	kpt-yts-24k01	15.94284652	99.69267739	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
49	kpt-whw-24k01	16.07770266	99.54524506	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
50	kpt-sps-24k01	15.92528305	99.62182539	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
51	kpt-stm-24k01	16.51778201	99.47951872	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
52	kpt-nce-24k01	16.08487731	99.63049102	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
53	kpt-npg-24k02	16.05427690	99.61464677	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
54	kpt-jtm-24k01	16.55188477	99.77466954	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
55	kpt-dkt-24k01	16.49963059	99.99840908	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
56	 ทุ่งมหาศาล	16.52946700	99.74795960	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
57	kpt-nsr-24k01	16.50975543	99.89620395	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
58	kpt-nyi-24k01	16.39454569	99.77319833	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
59	kpt-bkw-24k01	16.40497119	99.84797097	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
60	kpt-pta-24k01	16.48526431	99.77249635	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
61	kpt-mye-24k01	16.50028662	99.95505116	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
62	kpt-rna-24k01	16.54515046	99.48035593	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
63	kpt-srg-24k01	16.42275188	99.73230450	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
64	kpt-npt-24k01	16.42200998	99.90067640	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
65	kpt-nmt-24k01	16.41418947	99.94204801	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
66	kpt-nmk-24k01	16.44788806	99.94619843	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
67	kpt-nem-24k01	16.52340500	99.80150300	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
68	kpt-huy-24k01	16.45150000	99.78424000	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
69	kpt-tsn-24k01	16.26472745	99.98422844	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
70	kpt-tnm-24k01	16.17226985	99.91496725	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
71	kpt-bbn-24k01	16.30948654	100.01053591	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
72	kpt-pen-24k01	16.19389946	99.93358529	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
73	kpt-ysm-24k01	16.51923820	99.43956370	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
74	kpt-bsm-24k01	16.20707409	99.90587939	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
75	kpt-ksn-24k02	16.56548781	99.91788569	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
76	kpt-bsw-24k01	16.55957100	99.85218282	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
77	kpt-lkb-24k01	16.62401156	99.88311319	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
78	kpt-bcg-24k01	16.59003017	99.80888637	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
79	kpt-btr-24k01	16.69870912	99.85981489	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
80	kpt-twn-24k01	16.24119074	99.88333328	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
81	kpt-bmn-24k01	16.66598635	99.78600709	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
82	kpt-pcs-24k01	16.54154359	99.97142256	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
83	kpt-lkb-24k02	16.61165425	99.78716628	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
84	kpt-mjk-24k01	16.51913610	99.43000812	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
85	kpt-lkb-24k03	16.68311101	99.82990137	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
86	kpt-nlg-24k01	16.63195942	99.81068398	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
87	kpt-kpt-bigrock-02	16.52999433	99.60077697	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
88	kpt-kpt-bigrock-03	16.68575065	99.31060622	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
89	kpt-kpt-bigrock-01	16.57774648	99.50975569	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
90	kpt-kpt-bigrock-04	16.31535331	99.93509248	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
91	kpt-kpt-bigrock-08	16.04486124	99.70734778	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
92	kpt-kpt-bigrock-05	16.48732352	99.81537759	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
93	kpt-kpt-bigrock-06	15.99923289	99.45600802	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
94	kpt-amt-24k01	16.58717907	99.44996323	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
95	kpt-kpi-24k01	16.63367911	99.34999208	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
96	kpt-dsm-24k01 บ้านดงซ่อม	16.61858114	99.25462394	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
97	kpt-kto-24k01	16.64399255	99.31340613	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
98	kpt-kpi-24k02	16.65670299	99.31705427	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
99	kpt-stk-24k01	16.44882663	99.43207508	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
100	kpt-slt-24k01	16.45814351	99.35200068	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
101	 หนองกอง	16.46477529	99.30976309	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
102	kpt-kpk-24k01	16.59809617	99.45560420	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
103	kpt-knt-24k01	16.36194600	99.42756575	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
104	kpt-yrg-24k01	16.40846521	99.45616980	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
105	kpt-mbn-24k01	16.28761926	99.38293163	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
106	kpt-kdu-24k01	16.31441090	99.50578633	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
107	kpt-ksn-24k01	16.34026315	99.60593938	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
108	kpt-dne-24k01	16.19713022	99.43373544	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
109	kpt-mrn-24k01	16.32141716	99.47585714	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
110	kpt-wtg-24k01	16.33838330	99.44259942	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
111	kpt-wda-24k01	16.30763416	99.54705586	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
112	kpt-fkr-24k01	16.27676654	99.38008141	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
113	kpt-wkn-24k01	16.19178633	99.46813553	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
114	kpt-bgn-24k01	16.47919337	99.59239671	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
115	kpt-kyi-24k01	16.28752712	99.69882478	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
116	kpt-kmg-24k01	16.22962413	99.85811882	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
117	kpt-rdw-24k01	16.20300497	99.82555914	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
118	kpt-rmi-24k01	16.15951833	99.82698755	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
119	kpt-wti-24k01	16.27668000	99.79041000	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
120	kpt-syk-24k01	16.30620480	99.75154760	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
121	kpt-ntg-24k01	16.17317890	99.67852610	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
122	kpt-mld-24k01	16.15100102	99.72062468	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
123	kpt-skn-24k01	16.36502958	99.62481094	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
124	kpt-rsi-24k01	16.30829270	99.73572539	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
125	kpt-wsi-24k01	16.21842165	99.62475190	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
126	kpt-srn-24k01	16.18926489	99.59670703	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
127	kpt-nnm-24k01	16.29995706	99.78096560	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
128	kpt-ccb-24k01	16.18509085	99.53764138	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
129	kpt-wnm-24k01	16.20480301	99.76424895	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
130	kpt-nhw-24k01	16.21863372	99.66281513	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
131	kpt-ntn-24k01	16.26294246	99.65406901	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
132	kpt-nln-24k01	16.44377711	99.62545204	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
133	kpt-htn-24k01	16.25369520	99.61208940	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
134	kpt-kbn-24k01	16.28182128	99.58245021	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
135	kpt-pst-24k02	16.11001330	99.46900460	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
136	kpt-ptg-24k01	16.10507888	99.50265561	DE	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
137	kpt-nsi-24k01	16.05838944	99.46433167	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
138	kpt-kun-24k01	16.06935570	99.40771650	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
139	kpt-nhn-24k01	16.06350207	99.51696532	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
140	kpt-wpu-24k01	16.10905564	99.58475178	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
141	kpt-npi-24k01	16.13024461	99.59125269	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
142	kpt-kpu-24k01	16.17370110	99.32293800	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
143	kpt-sto-24k01	16.43914380	99.67497080	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
144	kpt-tke-24k01	16.16821530	99.36073550	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
145	kpt-kpa-24k01	16.11732230	99.32834527	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
146	kpt-npg-24k01	16.11072748	99.39790383	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
147	kpt-blm-24k01	16.18007636	99.38401647	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
148	kpt-kln-24k03	16.25218649	99.28664744	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
149	kpt-kpo-24k01	16.23737056	99.33754582	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
150	kpt-kln-24k04	16.27155828	99.34976077	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
151	kpt-kwg-24k01	16.68451123	99.54037260	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
152	kpt-mym-24k01	16.64636084	99.50955955	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
153	kpt-mpt-24k01	16.72212972	99.54725122	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
154	kpt-skw-24k01	16.48346332	99.62021526	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
155	kpt-nke-24k01	16.69844876	99.50523873	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
156	kpt-pki-24k02	16.61898556	99.54773976	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
157	kpt-kfi-24k01	16.10926725	99.83586284	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
158	kpt-tjn-24k01	16.06690537	99.90059075	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
159	kpt-nld-24k01	16.09146279	99.80822723	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
160	kpt-bdg-24k01	16.11039314	99.88326319	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
161	kpt-ntm-24k01	16.12467000	99.92656000	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
162	kpt-ktn-24k01	16.11396755	99.81291655	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
163	kpt-njk-24k01	16.38756649	99.70072310	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
164	kpt-ckg-24k01	16.17731100	99.99875458	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
165	kpt-dyn-24k01	16.15362378	100.00096280	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
166	kpt-bke-24k01	16.18881445	99.97894303	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
167	kpt-kyg-24k01	16.73897200	99.62240700	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
168	kpt-keg-24k01	16.67962840	99.66139893	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
169	kpt-kpg-24k01	16.60253395	99.66571260	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
170	kpt-wbk-24k01	16.70068661	99.65878590	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
171	kpt-wka-24k01	16.70651713	99.68824430	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
172	kpt-wpi-24k01	16.58521918	99.68639831	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
173	kpt-nhk-24k01	16.70712817	99.73942746	DE	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
174	kpt-kln-USO574SakNgam	16.32750713	99.32126857	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
175	KPT_NT2_USO-NPI_หนองไผ่_D[ER]	16.33812920	99.79052443	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
176	KPT_NT2_USO-NRG_หนองรวก_D[ER]	16.36063393	99.96688866	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
177	kpt-kpt-USO575SSW	16.30180713	99.42886726	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
178	kpt-sng-USO576PanThong	16.35766800	99.80950800	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
179	kpt-nol-USO577TMD	16.63074598	99.43522891	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
180	kpt-kwb-USO578TTD	16.34572077	99.90420648	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
181	kpt-ncm-USO581DPN	16.37715095	99.34816731	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
182	kpt-ncm-USO586LSL	16.44300307	99.32342568	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
183	kpt-ncm-USO588PKN	16.46664760	99.26368154	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
184	USO คลองสมุย	16.47552891	99.52949509	NT2	กำแพงเพชร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
185	kpt-ncm-USO607TNA	16.63464782	99.40598982	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
186	kpt-pst-USO553MWKT	16.02827175	99.39432077	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
187	kpt-ncm-USO611WCP	16.56883045	99.37645359	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
188	kpt-pki-USO613WKG	16.73391164	99.44120565	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
189	kpt-pki-USO616TMI	16.72206148	99.46103717	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
190	kpt-pki-USO617NSI	16.79538251	99.43002587	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
191	kpt-pki-USO621LKT	16.77057414	99.40507214	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
192	kpt-pki-USO623TMF	16.81082038	99.56789138	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
193	kpt-kpt-USO591STI	16.48469003	99.72784349	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
194	kpt-slb-USO539SSB	15.92666804	99.42096955	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
195	kpt-slb-USO554NSR	16.03321418	99.66092630	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
196	kpt-slb-USO540WPO	15.92190704	99.46617758	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
197	kpt-slb-USO543PBK	15.92871451	99.54148783	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
198	kpt-slb-USO550PMK	15.93201658	99.49834167	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
199	kpt-kwb-USO568STG	16.31025334	99.97148167	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
200	kpt-kln-USO555PlangSi	16.04510028	99.28985033	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
201	kpt-kpt-USO595MMO	16.32778996	99.40700826	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
202	kpt-ncm-USO599NDN	16.52114269	99.23002909	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
203	kpt-pst-USO558PTW	16.02632243	99.36844601	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
204	kpt-slb-USO569SKS	15.95176290	99.38434234	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
205	kpt-kpt-USO562NKM	16.49251635	99.68811287	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
206	kpt-slb-USO559WNS	16.00613861	99.69112470	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
207	kpt-kkg-USO584TSI	16.30204900	99.82131167	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
208	kpt-kwb-USO614TTG	16.34273680	99.84375416	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
209	kpt-kwb-USO564TNN	16.29817653	99.87698818	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
210	kpt-kkg-USO566NPN	16.24664579	99.53150877	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
211	KPT_NT2_KMLI_คลองแม่ลาย_D[LR]	16.40934902	99.52167137	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
212	KPT_NT2_KLN_คลองลาน_INDOOR[LR]	16.20419471	99.31939526	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
213	KPT_NT2_KPKI_คลองพิไกร_D[LR]	16.65841044	99.72822829	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
214	KPT_NT2_SNG_ไทรงาม_INDOOR[LR]	16.47428732	99.89792897	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
215	KPT_NT2_PDG_ปากดง_INDOOR[LR]	16.35914338	99.57871589	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
216	KPT_NT2_TNK เทพนคร_INDOOR[LR]	16.38209178	99.56619872	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
217	KPT_NT2_KTE_คณฑี_D[ER]	16.34765913	99.66299843	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
218	KPT_NT2_WKM2_วังแขม_D[LR]	16.17110767	99.79836805	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
219	KPT_NT2_NBM_นาบ่อคำ_INDOOR[LR]	16.40498524	99.36057254	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
220	KPT_NT2_NCM_นครชุม_INDOOR[LR]	16.47894557	99.49919050	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
221	KPT_NT2_SWN_ทุ่งทราย ม.15_D[LR]	16.31032341	99.83191192	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
222	KPT_NT2_BBNG_บ่อเงิน_D[LR]	16.47861416	99.59266408	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
223	KPT_NT2_RHN_ระหาน ม.3_D[LR]	16.15691580	99.94243499	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
224	KPT_NT2_PKID_ที่ว่าการ อ.พรานกระต่าย_D[LR]	16.66419931	99.58864668	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
225	KPT_NT2_KM2_แยกพิจิตร_D[LR]	16.47362696	99.55055945	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
226	KPT_NT2_PMK_ปางมะค่า_D[ER]	15.93191541	99.49730674	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
227	KPT_NT2_TTE_ทุ่งเศรษฐี_D[LR]	16.45314450	99.49665010	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
228	KPT_NT2_PDGM_ตลาดปากดง_D[LR]	16.35549967	99.57573944	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
229	KPT_NT2_TMK_ท่ามะเขือ_D[LR]	16.23596781	99.73319471	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
230	KPT_NT2_LMK_ลำมะโกรก_D[LR]	16.49476081	99.53933001	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
231	KPT_NT2_MKO_แยกแมคโคร_D[LR]	16.45618459	99.53349013	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
232	KPT_NT2_SWNM11_ทรายทอง ม.11_D[ER]	16.34652260	99.90609061	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
233	KPT_NT2_TKO_ท่าตะคร้อ_D[ER]	16.36960178	99.59156670	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2968	lpg_byo_xgpon	18.29555809	99.49240622	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
234	KPT_NT2_MPG_แม่ปิงวิลเลจ_D[LR]	16.46816407	99.52112373	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
235	KPT_NT2_NPK_หนองปิ้งไก่_D[LR]	16.42654000	99.36287200	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
236	KPT_NT2_KWB_ขาณุวรลักษบุรี_INDOOR[LR]	16.06162103	99.86095987	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
237	KPT_NT2_STO_แสนตอ_D[LR]	16.02714939	99.82088167	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
238	KPT_NT2_PNR_โป่งน้ำร้อน_D[LR]	16.33142110	99.30416268	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
239	KPT_NT2_BTO_บ่อถ้ำ_D[LR]	15.96671188	99.76631943	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
240	KPT_NT2_PTW_ปางตาไว_D[ER]	16.02250990	99.36816636	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
241	KPT_NT2_KNTG_เขานางทอง_D[LR]	16.58580483	99.60417927	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
242	KPT_NT2_PKN_ปางขนุน_D[LR]	16.46681223	99.26356394	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
243	KPT_NT2_KKG_คลองขลุง_D[LR]	16.21660880	99.71497004	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
244	KPT_NT2_LKT_ลานกระทิง_D[LR]	16.77393650	99.40278597	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
245	KPT_NT2_NSR_เนินสำราญ_D[ER]	16.03387000	99.66262400	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
246	KPT_NT2_PBK_พัดโบก_D[LR]	15.92906720	99.53885838	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
247	KPT_NT2_TSKD_ท่าเสากระโดง_D[LR]	16.37538281	99.54024577	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
248	KPT_NT2_TBEV_โรงงานเบียร์ช้าง_INDOOR[LR]	16.16410182	99.72736265	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
249	KPT_NT2_CPG_ช่างปล้อง_D[LR]	16.47318835	99.53544327	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
250	KPT_NT2_TMR_ธำมรงค์_D[LR]	16.33986658	99.65791964	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
251	KPT_NT2_LKB_ลานกระบือ_INDOOR[LR]	16.60339078	99.84861559	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
252	KPT_NT2_RDTG_บ้านไร่ดอนแตง_D[LR]	16.04062000	99.70385600	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
253	KPT_NT2_SNGM_ตลาดไทรงาม_D[LR]	16.46668478	99.89083767	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
254	KPT_NT2_KPK_กัลปพฤกษ์_D[ER]	16.59740907	99.45619073	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
255	KPT_NT2_KNLI_คลองน้ำไหล_D[LR]	16.19651394	99.33058894	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
256	KPT_NT2_NPLG_แยกโนนพลวง_D[LR]	16.59863324	99.85493686	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
257	KPT_NT2_TSB1_โรงเรียนเทศบาล1_D[LR]	16.47918157	99.53643574	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
258	KPT_NT2_BBMF_บ่อมะเฟือง_D[LR]	16.67675969	99.59220988	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
259	KPT_NT2_NPDG_หนองปากดง_D[ER]	16.63587555	99.75239429	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
260	KPT_NT2_KPE_โกสัมพีนคร_D[LR]	16.63367294	99.35045066	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
261	KPT_NT2_PKI_พรานกระต่าย_INDOOR[LR]	16.65150019	99.58847785	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
262	KPT_NT2_KPHD_หมวดการทางนครชุม_D[LR]	16.48035264	99.49463086	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
263	KPT_NT2_SKR_วัดสิงคาราม_D[LR]	16.00070176	99.80417035	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
264	KPT_NT2_HNOL_รพ.สต.หนองปลิง_D[LR]	16.51758258	99.50046335	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
265	KPT_NT2_SYT_ศรีโยธิน_INDOOR[LR]	16.52603166	99.51640019	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
266	KPT_NT2_PKPT_สภอ.กำแพงเพชร_D[LR]	16.48434835	99.52033760	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
267	KPT_NT2_NPNM_หนองผักหนาม_D[ER]	16.24680913	99.53193526	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
268	KPT_NT2_KMHK_โขมงหัก_D[LR]	16.42445699	99.54565395	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
269	KPT_NT2_WKKG_โรงงานวุ้นเส้น_D[LR]	16.18979397	99.71052580	NT2	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
270	KPT_NT2_CKRO_หมู่บ้านชากังราวปาร์ควิว_OUTDOOR[LR]	16.49317449	99.51729566	NT2	กำแพงเพชร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
271	KPT_NT2_NPG_หนองปลิง_INDOOR[LR]	16.52076714	99.51222747	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
272	KPT_NT2_BMSP_บ้านใหม่สุวรรณภูมิ_INDOOR[LR]	16.45389210	99.45715620	NT2	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
273	NT1_บ้านวังซอง	16.55078000	101.21425700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
274	NT1_บ้านซำอีเลิศ	16.55193000	101.13950100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
275	NT1_บ้านน้ำลัด	16.27705000	100.84927800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
276	NT1_CDMA ชนแดน	16.18493000	100.87138900	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
277	NT1_บ้านซับพุทรา	16.02940000	100.94426600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
278	NT1_บ้านซับเปิบ	16.34681000	100.92212300	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
279	NT1_CDMA วังโป่ง-1	16.32435000	100.80374700	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
280	วังโป่ง	16.32412800	100.80362800	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
281	NT1_บ้านวังชะนาง	16.30464000	100.70093900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
282	NT1_บ้านโนนตูม	16.36633000	100.83175100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
283	NT1_CDMA ท่าข้าม	16.16345000	100.80893300	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
284	NT1_ลาดแค	16.04386000	100.83577900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
285	NT1_หนองใหญ่	15.94942000	100.84500400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
286	NT1_บ้านศาลาลาย	16.12040000	100.79776300	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
287	หล่มเก่า	16.88074600	101.23392900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
288	บ้านพรวน	16.87456400	101.22805000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
289	NT1_Huawei บ้านสำนักหมัน	16.48235000	101.15973900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
290	NT1_CDMA Calix บ้านสำนักหมัน1	16.48219000	101.16038100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
291	NT1_บ้านนางั่ว	16.52209000	101.14939800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
292	NT1_CDMA ดงขุย	16.12027000	100.73972500	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
293	NT1_บ้านกล้วย (บ้านเขาคณฑา)	16.05844000	100.74276000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
294	NT1_CDMA บ้านโภชน์	15.90611000	101.02768700	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
295	NT1_Banphot	15.91410000	101.01817100	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
296	NT1_สค.หนองไผ่ 2	16.00161000	101.06788000	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
297	NT1_บภก.เพชรบูรณ์-4 ZTE-C620	16.41937000	101.15596400	NT1	เพชรบูรณ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
298	บ้านนาป่า	16.38626500	101.21855000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
299	บ้านน้ำร้อน	16.33038800	101.18725400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
300	บ้านหนองนารี	16.43791000	101.14131000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
301	NT1_โหนดอุทยานน้ำหนาว	16.73939000	101.56962500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
302	สถานีทวนสัญญาณ ปากดุก	16.72755200	101.25743600	NT1	เพชรบูรณ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
303	แคมป์สน	16.76849085	101.03142140	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
304	โม่งเม่ง	16.64835100	101.01177700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
305	สะเดาะพงษ์	16.57107600	100.98876100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
306	เสลี่ยงแห้ง	16.58781720	100.95250900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
307	หนองแม่นา	16.56735700	100.90282900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
308	บ้านติ้ว	16.79782300	101.30676600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
309	ห้วยสนามทราย	16.66850400	101.73839900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
310	พ่อขุนผาเมือง	16.75326320	101.20085900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
311	น้ำก้อ	16.79900000	101.17713400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
312	ทุ่งสมอ	16.70925700	101.03940000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
313	เขาค้อ	16.61936000	100.99176500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
314	อ.น้ำหนาว	16.76476100	101.67508600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
315	หลักด่าน	16.96917100	101.48769200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
316	กกกะทอน	16.98659400	101.19995100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
317	NT1_โหนด บ้านนาหนอง	17.03108000	101.20840000	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
318	NT1_โหนด บ้านท่าข้าม	16.95047000	101.18472000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
319	NT1_โหนดบ้านท่าผู	16.96273000	101.21790000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
320	NT1_โหนดบ้านหนองยาว	16.93921000	101.24581200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
321	NT1_โหนดบ้านวังขอน	16.96962000	101.29610600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
322	บุ่งน้ำเต้า	16.67681500	101.16190600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
323	บุ้งคล้า	16.64084800	101.16312400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
324	วังมล	16.82860400	101.25852400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
325	NT1_วังมล 2	16.82930000	101.25765800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
326	ป่าเลา	16.43758200	101.11275100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
327	NT1_CDMA วังชมภู1	16.27102000	101.05795400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
328	NT1_บ้านนายม	16.26283000	101.09752500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
329	NT1_บ้าน กม.2	16.25356000	101.06319800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
330	NT1_บ้านวังเจริญ	16.26813000	101.03931800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
331	NT1_Huawei หน้าค่าย	16.38889000	101.12753100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
332	เซ็นต์โย(หน้าค่าย)	16.38938600	101.12959700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
333	บ้านน้ำอ้อม	16.35130900	100.70852900	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
334	ตะเบาะ	16.33838700	101.23624900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
335	บ้านห้วยสะแก	16.16157400	101.07204700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
336	บ้านระวิง	16.16646200	101.14510500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
337	ห้วยระหงษ์	16.76530000	101.47066000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
338	บ้านวังยาว	16.73670000	101.42890000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
339	NT1_บ้านสงเปลือย	17.03131000	101.27864900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
340	บ้านอีเลิศ	17.00776400	101.24665000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
341	วังบาล	16.91035500	101.19747700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
342	บ้านโจ๊ะโหวะ	16.88640000	101.17514900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
343	ภูทับเบิก	16.92439900	101.12279300	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
344	NT1_CDMA บึงสามพัน	15.77170000	101.00785000	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
345	NT1_สท.บึงสามพัน	15.78883000	101.00364500	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
346	NT1_บ้านโปร่งบุญเจริญ	15.75260000	100.85772300	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
347	NT1_วัดไทยถาวร	15.79764000	100.85258800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
348	NT1_สามแยกวิเชียรบุรี	15.65330000	101.04100200	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
349	NT1_HUAWEI_cdma นาเฉลียง	16.07451000	101.06601200	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
350	NT1_บ้านปากตก	16.08072300	100.97470900	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
351	NT1_CDMA ศรีมงคล	15.82206000	100.81212500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
352	ท่าเสา	15.90257800	101.12921900	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
353	กันจุ	15.83693200	101.08321200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
354	NT1_Wichianburi	15.66240000	101.10491800	NT1	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
355	NT1_วิเชียรบุรี	15.67220000	101.11419900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
356	NT1_บ่อรังoutdoor	0.00000000	0.00000000	NT1	เพชรบูรณ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
357	NT1_CDMA นาตะกรุด	15.43046000	101.16189200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
358	NT1_หนองย่างทอย	15.39196000	101.23913500	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
359	NT1_สามแยกท่าด้วง	15.96440000	101.30387800	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
360	NT1_บ้านเขาสูง	15.76364777	101.22269458	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
361	ศรีเทพ	15.45165700	101.06855200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
362	NT1_Nongsakea-Temple	15.36595000	101.08684300	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
363	พุเตย	15.57612200	101.06744600	NT1	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
364	วังใหญ่	15.60029100	100.96923600	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
365	NT1_รวมทรัพย์	15.55631000	100.90659700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
366	NT1_บ้านวังไผ่	15.57584000	101.11632200	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
367	NT1_สค.หล่มสัก	16.78540000	101.24291100	NT1	เพชรบูรณ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
368	ซำม่วง	16.91858900	101.58622900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
369	NT1_วังกวาง	16.89800000	101.64702000	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
370	วังรู	16.83630300	101.30746500	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
371	เข็กน้อย	16.80551600	100.96804900	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
372	NT1_โหนด ตาดกลอย	17.00459000	101.36230100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
373	บ้านโคก	16.44976300	101.22943700	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
374	ห้วยใหญ่	16.47482300	101.29899100	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
375	บ้านกลาง	16.62688800	101.26295400	NT1	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
376	KHN (ชส.คลองห้วยนา)	16.14036531	100.87190844	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
377	pbn-smd-24k01	15.76474890	100.93886380	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
378	pbn-pbc-24k01	15.72687227	100.86793540	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
379	HTG (ชส.ห้วยตะกั่ว)	15.74846505	100.85878024	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
380	TAM1 (ชส.ท่าแดงม.1)	15.99100000	101.13415000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
381	pbn-ytd-24k01	15.99423320	101.16883640	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
382	BTD (ชส.บ้านท่าแดง)	15.97152025	101.16381526	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
383	DE_WADM5 (ชส.วังท่าดี ม.5)	15.99601000	101.18753300	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
384	pbn-yrh-24k01	15.83071072	101.00924890	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
385	DE_NCS (ชส.หนองชุมแสง)	15.88514967	101.01960897	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
386	WHD (ชส.วังหูดิน)	15.86921373	100.97485363	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
387	pbn-wrg-24k01	16.17463146	100.90809020	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
388	pbn-kc18-24k01	15.83562000	101.07724000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
389	KCM12 (ชส.กันจุ ม.12)	15.83868838	101.12033536	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
390	pbn-kc14-24k01 ชส.กันจุ ม.14	15.82831968	101.16252000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
391	POM12 (ชส.เพชรละคร.ม12)	15.88891733	101.12228319	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
392	pbn-kpm3-24k01	15.75240241	101.16011900	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
393	DE_SEL (ชส.ซับอิลุ้ม)	15.79713412	101.19573891	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
394	DE_NSG (ชส.โนนสง่า)	15.76712600	101.22763869	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
395	YGS (ชส.ยางสาว)	15.74616772	101.25443637	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
396	pbn-sks-24k01	15.76732000	101.01202000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
397	DE_YKSP (ชส.แยกโค้งสุพรรณ)	15.72029283	101.05289361	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
398	pbn-pbm4-24k01	16.20620964	100.94261880	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
399	pbn-rbsp-24k01	15.78889456	100.98931070	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
400	pbn-sko-24k01	15.68028625	100.87807690	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
401	WPR (ชส.วังปลา)	15.83001514	100.90337175	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
402	PYG (ชส.พญาวัง)	15.85783309	100.87926507	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
403	WKM (ชส.วังมะขาม)	15.87717025	100.86007118	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
404	pbn-thke-24k01	15.89445731	100.85160080	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
405	CSR (ชส.ซับสำราญ)	15.90495884	100.81042886	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
406	PSW (ชส.โป่งสวอง)	15.82271445	100.82649797	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
407	HDY (ชส.หินดาดใหญ่)	15.80804784	100.90632214	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
408	pbn-ahn-24k01	16.24703201	100.94602390	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
409	TKPI (ชส.ตระกุดไผ่)(FTTx)	15.59071506	101.01932331	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
410	WYI (ชส.วังใหญ่)	15.60047116	100.96741453	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
411	HGT (ชส.หนองกระทุ่ม)	15.56735302	101.02872359	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
412	PUKM (ชส.พุขาม)	15.54692376	101.04966516	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
413	BKSA (ชส.ศรีเทพ (บ้านโคกสะอาด)	15.48191569	101.01196870	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
414	KOSG (ชส.โคกสง่า)	15.51246469	101.05283484	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
415	pbn-ytn-24k01	15.51390140	100.96970560	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
416	PNY (ชส.ภูน้ำหยด)	15.51714040	100.94142770	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
417	RSB (ชส.รวมทรัพย์)	15.55618624	100.90704940	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
418	pbn-pb27-24k01	16.27857937	100.85015050	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
419	SWB (ชส.ศาลจังหวัดวิเชียรบุรี)	15.61059218	101.06105285	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
420	SSB (ชส.ซับสมบูรณ์)	15.64478503	101.00683605	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
421	KTT (ชส.กระทุ่มทอง)	15.66500000	100.98393000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
422	pbn-wph-24k01	15.57617239	101.11407950	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
423	pbn-sdm1-24k01	15.64687000	101.04402000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
424	BKLUK (ชส.บ้านคอเลือก)	15.64673450	101.06554397	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
425	KNO (ชส.เขาน้อย)	15.66480000	101.15710000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
426	KSRN (ชส.โคกสำราญ)	15.67670000	101.20678000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
427	pbn-orm2-24k01	15.60051592	101.18026070	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
428	PJH (ชส.โป่งเจ็ดหัว)	16.29040886	100.87434303	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
429	BMW (ชส.บ้านใหม่วิไลวัลย์)	15.62990000	101.21234000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
430	NBT (ชส.หนองบัวทอง)	15.59830000	101.22996000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
431	RNT (ชส.โรงงานน้ำตาล)	15.46337011	101.10614039	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
432	BNJ (ชส.บึงนาจาน)	15.47528925	101.13705050	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
433	STPN (ชส.ศรีเทพน้อย)	15.47566472	101.16631095	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
434	NTK (ชส.นาตะกรุด)	15.42336081	101.16308708	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
435	KRY (ชส.โคกรังย้อย)	15.56711572	101.02991939	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
436	NUM.3 (ชส.นาสนุ่น ม.3)	15.52551204	101.18489767	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
437	KKT (ชส.เขาคณฑา)	16.06084095	100.74370623	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
438	BTP (ชส.บัวทองพัฒนา)	15.52794865	101.15003943	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
439	NTW (ชส.เนินถาวร)	15.51873812	101.23814648	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
440	RHO (ชส.ร่องหอย(FTTx))	15.44106676	101.01573586	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
441	PDM (ชส.ประดู่งาม)	15.43778314	100.97767800	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
442	pbn-tst-24k01	15.42181229	101.03565800	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
443	KHN (ชส.โคกหิน)	15.40874423	101.06988966	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
444	GGM.6 (ชส.คลองกระจัง ม.6(FTTx))	15.39660730	101.10029124	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
445	KPN (ชส.คลองสานพัฒนา)	15.35474493	101.06454872	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
446	WKN (ชส.วังขอน)	15.35871455	101.03643179	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
447	MDG (ชส.มอดินแดง)	15.37691064	101.11723065	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
448	pbn-ngy-24k01	16.23544761	100.72589900	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
449	GGM.1 (ชส.คลองกระจัง ม.1(FTTx))	15.34826001	101.13442867	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
450	TLG (ชส.ท่าเลียง)	15.40182955	101.11882657	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
451	NASM.6 (ชส.นาซำ ม.6)	17.00726853	101.24601777	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
452	pbn-wmpg-bigrock-01	16.27367574	100.80133320	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
453	pbn-syw-bigrock-01	16.26291365	101.03938650	DE	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
454	SAK (ชส.สระแก้ว)	15.87453875	101.23522639	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
455	pbn-tad-bigrock-01	16.77300748	101.25189900	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
456	BWY (ชส.บ้านวังยาว)	16.73675792	101.42858148	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
457	DKN (ชส.ดงแขวน)	16.20173477	100.78814775	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
458	 CPS (ชส.แคมป์สน)	16.76894488	101.02432533	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
459	BRN (ชส.บ้านรัตนัย)	16.63903550	100.97415921	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
460	BLL (ชส.บ้านเล่าลือ)	16.65863255	101.01884213	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
461	BWRU (ชส.บ้านวังรู)	16.83307074	101.27225364	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
462	 _HNRCH (ชส.บ้านหนองรางช้าง)	16.57601242	100.91258685	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
463	BANY (ชส.บ้านนายาว)	16.72940000	101.01768400	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
464	KMO2 (ชส.บ้านกม.2)	16.25487687	101.06316805	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
465	pbn-nno-bigrock-01	16.76751119	101.67282340	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
466	CHWS (ชส.จะวะสิต)	16.53329762	101.09778605	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
467	SLH (ชส.เสลียงแห้ง)	16.58716797	100.95605825	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
468	KCN (ชส.เขาชะโงก)	16.03617515	100.79799145	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
469	BRIM1 (ชส.บ้านไร่ ม.1)	16.65069605	101.21271193	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
470	SPM (ชส.สะเดาะพง)	16.57110269	100.98839836	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
471	pbn-pnnk-bigrock-01	16.32766514	101.07845259	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
472	KPM (ชส.คลองปลาหมอ)	16.11615517	100.80134019	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
473	LCE (ชส.ลาดแค)	16.04280660	100.83710745	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
474	DLG (ชส.ดงลึก)	16.28401330	100.81410885	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
475	NAM (ชส.น้ำอ้อม)	16.35123509	100.70803285	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
476	WHS (ชส.วังหินซอง)	16.36163008	100.74095964	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
477	ดงขุย	16.12058515	100.73187910	DE	เพชรบูรณ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
478	BKMS (ชส.บ้าน กม.30)	16.12979142	100.69113380	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
479	BWR (ชส.บ้านวังรวก)	16.07320273	100.70580190	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
480	pbn-ptg-24k01	16.24668823	100.81134350	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
481	WCN (ชส.วังชะนาง)	16.30452020	100.70329670	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
482	NTM (ชส.โนนตูม)	16.36683445	100.83259866	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
483	WST (ชส.วังทรายทอง)	16.37558615	100.86960375	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
484	HUM1 (ชส.ห้วยสะแก ม.1)	16.21821996	101.08922128	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
485	HYM9 (ชส.ห้วยใหญ่ ม.9)	16.45890000	101.28908000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
486	DE_ HU13 (ชส.ห้วยสะแก ม.13)	16.16900000	101.07681000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
487	DE_RBRW (ชส.โรงเรียนบ้านระวิง)	16.14641404	101.09981350	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
488	pbn-tnb-24k01	16.24761527	101.13493860	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
489	DE_BHC (ชส.บ้านหัวช้าง)	16.23728890	101.14300936	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
490	BTKT (ชส.บ้านท่ากกตาล)	16.52828966	101.21617248	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
491	pbn-rwg-24k01	16.18240330	101.14878680	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
492	BLPSM (ชส.บ้านลำป่าสักมูล)	16.50079438	101.21178671	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
493	TPM9 (ชส.ท่าพล ม.9)	16.55092832	101.21224195	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
494	BKKY (ชส.บ้านกงกะยาง)	16.51097594	101.23638721	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
495	BPT (ชส.บ้านโพธิ์ทอง)	16.58210170	101.20452508	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
496	pbn-pwa-24k01	16.51531545	101.28521200	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
497	CTM2 (ชส.ช้างตะลูด ม.2)	16.57930000	101.30747000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
498	DE_BA10 (ชส.บ้านกลาง ม.10)	16.62476440	101.26370071	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
499	BNT (ชส.บุ่งน้ำเต้า)	16.66286342	101.15963148	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
500	NMCH (ชส.น้ำชุน)	16.72502346	101.18624130	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
501	HUL (ชส.ห้วยลาน)	16.71619339	101.15543053	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
502	NMKO (ชส.น้ำก้อ)	16.79249931	101.18159268	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
503	BNDN (ชส.บ้านน้ำเดื่อเหนือ)	16.54651644	101.31845172	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
504	LBM6 (ชส.ลานบ่าม.6)	16.68427514	101.21394073	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
505	BNP (ชส.บ้านน้ำพุ)	16.63535835	101.30148161	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
506	pbn-ncy-24k01	16.76688454	101.17215450	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
507	BTW (ชส.บ้านติ้ว)	16.79564446	101.30304346	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
508	BTCH (ชส.หล่มสัก (บ้านท่าช้าง))	16.81524231	101.32618210	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
509	BRB (ชส.บ้านร่องบง)	16.76785054	101.28036869	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
510	PHG (ชส.ปากช่อง)	16.72114404	101.28883684	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
511	OBWP (ชส.อบต.วัดป่า)	16.82177677	101.25508329	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
512	SKM1 (ชส.สักหลง ม.1)	16.83430000	101.29969000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
513	BTMT (ชส.บ้านท่ามะทัน)	16.85114929	101.32681626	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
514	pbn-wml-24k01	16.87485360	101.32389440	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
515	DE_BBG (ชส.บ้านบึง)	16.82409634	101.22847494	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
516	WPM1 (ชส.วังโป่งม.1)	16.33760802	100.79435268	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
517	PTK (ชส.ปากตก)	16.07907606	100.99086374	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
518	PKK (ชส.ปากคลองกรวด)	16.06046552	101.07388226	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
519	NKD (ชส.นาข้าวดอ)	16.05820413	101.14777833	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
520	BKJL (ชส.บ้านโคกเจริญ)	16.04213340	101.18589824	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
521	BWM6 (ชส.บ้านวังโบสถ์ ม.6)	16.04217111	101.13225907	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
522	BT11 (ชส.บ่อไทยม.11)	16.06597230	101.18094776	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
523	CDN (ชส.ชนแดน)	16.18676768	100.86660877	DE	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
524	BNSB (ชส.บ้านโนนสมบูรณ์)	16.07647000	101.19353900	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
525	NPIหนองไผ่	15.99115456	101.06087841	DE	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
526	BKPN (ชส.บ้านโคกพัฒนา)	15.95052360	101.00630790	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
527	pbn-ktn-24k01 ชส.กองทูล	15.94694974	101.09370460	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
528	pbn-npi-24k03	15.91617431	101.02673292	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
529	BWTN (ชส.บัววัฒนา)	15.94302906	101.03089973	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
530	KKB (ชส.คลองกระโบน)	15.91423976	101.03694677	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
531	BOM5 (ชส.บ่อไทย ม.5)	16.09710000	101.20995000	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
532	KTT (ชส.เขาถ้ำโถ)	16.12035269	101.03776217	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
533	DE_BHNB (ชส.ห้วยน้ำบ่อ)	16.09688141	101.04699379	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
534	pbn-djl-24k01	16.34629927	100.69048850	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
535	HMK (ชส.ห้วยมะเขือ)	16.86830422	101.22518148	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
536	NSG (ชส.นาแซง)	16.85396000	101.22801800	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
537	pbn-pbn-24k01	16.91221619	101.18497808	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
538	JWO (ชส.โจะโหวะ)	16.87561034	101.19054589	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
539	pbn-nkg-24k01	16.90596874	101.20263280	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
540	HHM4 (ชส.หินฮาว ม.4)	16.93987658	101.21809219	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
541	BKT (ชส.บ้านแก่งโตน)	17.02931545	101.19929053	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
542	BTK (ชส. บ้านท่าข้าม)	16.95086933	101.18466122	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2969	LPG-THA-SRI	18.42238282	99.74555901	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
543	DE_BHS (ชส.บ้านห้วยทราย)	15.73634209	100.89630783	DE	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
544	pbn-npi-USO549	15.97394878	100.97347820	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
545	pbn-pbn-uso573 (USO-ตะเบาะ)	16.33556048	101.23921366	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
546	pbn-lko-uso626 (ห้วยหินลับ)	16.87838552	101.63487969	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
547	pbn-lko-uso637 (ห้วยลาด)	16.96470255	101.50667761	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
548	pbn-lko-uso640 (ผาลาน้อย)	16.94488029	101.56356546	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
549	pbn-lko-uso643 (USO-ตาดกลอย)	17.00025471	101.36984900	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
550	pbn-lko-uso655 (USO-กกกล้วยนวน)	17.03604514	101.44641587	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
551	pbn-lko-uso658 (USO-วังเวิน)	17.02451445	101.37312999	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
552	pbn-lko-uso650 (USO-ศิลา)	17.02467719	101.31765348	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
553	pbn-lko-uso635 (ซับม่วง)	16.91768290	101.58645948	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
554	pbn-stp-uso489 (USO-เนินมะขามป้อม)	15.41747799	101.23405599	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
555	pbn-stp-uso500 (USO-หนองย่างทอย)	15.39265575	101.23878942	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
556	pbn-stp-uso505 (พระที่นั่ง)	15.60145990	100.90192433	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
557	pbn-npi-uso556 (USO-ซับชมภู)	15.92171671	100.96323870	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
558	pbn-wcb-USO512	15.69189300	101.25460600	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
559	pbn-bun-uso538 (ท่าด้วง)	15.96353434	101.30513769	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
560	pbn-bun-uso545 (คลองบน)	15.92143466	100.85103131	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1198	tak-rtp9-24k01	16.45389963	98.79656464	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
561	pbn-bun-uso546 (เขาพลวง)	15.87481332	101.27351238	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
562	หนองแจง ม.10(FTTx)	15.85468452	101.01161460	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
563	หนองไขว่ ม.4 (FTTx)	16.75629999	101.21301430	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
564	น้ำร้อน(FTTx)	16.34072930	101.18538270	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
565	บ้านนางั่ว (FTTx)	16.52204156	101.15659868	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
566	บ้านโคก(FTTx)	16.43979600	101.21517700	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
567	นาป่า ม.3 (FTTx)	16.39130000	101.24023000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
568	บ้านโตก ม.1 Fttx	16.35710933	101.10065149	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
569	ทุ่งสมอ ม.4(FTTx)	16.70000000	101.03949000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
570	 การเคหะ	16.40855900	101.15808000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
571	แยกโพธิ์ล้ม	16.42135921	101.14538884	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
572	น้ำหนาว(FTTx)	16.76732089	101.66794831	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
573	 ZTE นาซำ ม.4	16.99397823	101.20027919	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
574	 ZTE บ้านติ้ว	16.79635500	101.30429500	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
575	โคกปรง ม.3 (FTTX)	15.75191516	101.15997950	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
576	 ZTE สระประดู่ ม.1	15.64713946	101.04375950	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
577	บ้านไร่ ม.1(FTTx)	16.64391661	101.21767304	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
578	บ้านกลาง ม.10(FTTx)	16.62902861	101.25833350	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
579	สะเดียง ม.8(FTTx)	16.43603586	101.11344360	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
580	บ่อรัง ม.1	15.90050000	101.30429500	NT2	เพชรบูรณ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
581	SGM1_ชส.ศรีมงคล ม.1 (FTTx)	15.81812355	100.80581814	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
582	เขาค้อ (FTTx)	16.62733193	100.99390830	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
583	น้ำครั่ง (FTTx)	16.90599825	101.20307540	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
584	WHM1_ชส.วังหิน ม.1 (FTTx)	16.39015140	100.78187388	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
585	เพชรละครหมู่12(Fttx)	15.90050000	101.12783000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
586	เพชรละครหมู่2(Fttx)	15.89321936	101.10284930	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
587	GGM6_คลองกระจัง ม.6 (FTTx)	15.39352831	101.10489834	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
588	บุ่งคล้า (FTTx)	16.63934119	101.16279720	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
589	ปากปู่ (FTTX)	16.46345000	101.15711900	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
590	คลองมะนาว	16.55749285	101.17039000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
591	BNC_ชส.บึงนาจาน (FTTx)	15.47110000	101.13515000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
592	 ZTE วังขอน	15.36406000	101.03059500	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
593	หนองแม่นา ม.6 (FTTx)	16.56645705	100.90125870	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
594	YSWG_ชส.แยกสว่าง (FTTx)	16.77666802	101.24144100	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
595	บ้านพลำ (FTTx)	16.41904220	101.10690050	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
596	PCRU_ชส.มหาวิทยาลัยราชภัฏเพชรบูรณ์ (FTTx)	16.45142200	101.15325600	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
597	MPDO_ชส.ที่ว่าการอําเภอเมืองเพชรบูรณ์ (FTTx)	16.44306800	101.15109000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
598	TNM_ชส.เทพนิมิตร (FTTx)	15.78141702	101.01464642	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
599	YWTG_ชส.แยกวัดทุ่ง (FTTx)	16.77817138	101.24761850	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
600	BWI_ชส.บ้านหวาย (FTTx)	16.78090000	101.28000000	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
601	แยกหนองนารี (FTTx)	16.43560251	101.14770850	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
602	หมู่บ้านเพชรชมภู (FTTx)	16.40842000	101.14434300	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
603	โคกเจริญ	16.04157000	101.18571330	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
604	เขาพลวง	15.87478640	101.27327273	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
605	บ้านคลองเจริญ	16.35430880	101.16666787	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
606	เพชรบูรณ์ (XGPON)	16.42042547	101.15842181	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
607	หล่มสัก (XGPON)	16.78494897	101.24258010	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
608	ศรีเทพ (XGPON)	15.46284282	101.06406990	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
609	ซับสมอทอด (XGPON)	15.79619452	101.00861650	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
610	หล่มเก่า (XGPON)	16.88474923	101.23214359	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
611	นาเฉลียง (XGPON)	16.07590000	101.05372000	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
612	วิเชียรบุรี (XGPON)	15.65642199	101.10338900	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
613	พุเตย (XGPON)	15.57871784	101.06416828	NT2	เพชรบูรณ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
614	ท่าพล (XGPON)	16.57121428	101.15114849	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
615	วังพิกุล	15.71694218	100.83862344	NT2	เพชรบูรณ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
616	CRI_GPON-FH Padad NT1 on NT2	19.50163437	99.99291596	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
617	CRI_GPON-FH Padad NT1	19.49496300	99.99294290	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
618	CRI_GPON FH MaeFahLuang2 NT1	20.05379290	99.87634997	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
619	CRI_GPON FH WiangChai NT1	19.88110970	99.93377858	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
620	CRI_GPON FH Donsila NT1	19.85297410	100.03926120	NT1	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
621	CRI_GPON-FH Wiang-Chiang-Rung NT1	20.00163990	100.04494275	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
622	CRI_GPON-FH Prayamengrai NT1	19.84406860	100.15505364	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
623	CRI_GPON FH HuaiSak NT1	19.77116760	99.91171700	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
624	CRI_GPON FH PaNgae NT1	19.55673420	99.97210007	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
625	CRI_GPON-FH MaeLao NT1	19.74274220	99.72783150	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
626	CRI_GPON FH Doi Luang NT1	20.11694650	100.10116207	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
627	CRI_GPON FH WiangPaPao NT1	19.36456620	99.50624310	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
628	CRI_GPON-FH SriSaiMoon NT1	19.89520400	99.84707448	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
629	CRI_GPON FH Boonrueng NT1	20.00282000	100.33821265	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
630	เชียงแสน(ติดตั้งที่nt2)	20.27681966	100.08169002	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
631	cr-csns-ol-f554-1	20.27977500	100.07007757	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
632	CRI_GPON FH Maesuai NT1	19.65858689	99.53694837	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
633	CRI_GPON FH HuaiSan NT1	19.78576430	99.65951425	NT1	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
634	cr-msi-stns-ol-f602_Xgpon-1(สันถนนใหม่)	20.36746000	99.96687160	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
635	cr-msio-ol-f556-1(สค.แม่สาย#2)Xgpon	20.41164070	99.88444244	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
636	cr-kcgs-ol-f554-1	20.42065800	99.98208450	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
637	cr-btms-ol-f554-1	20.32560000	99.88329000	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
638	cr-hkis-ol-f556-1	20.27697500	99.86364561	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
639	cr-mdgs-ol-f556-1	20.44389680	99.89564715	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
640	cr-bdid-ol-f554-1	20.30757410	99.96019873	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
641	cr-bjgd-ol-f554-1	20.36668370	99.88424959	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
642	CRI_GPON-FH ThaipostMaeChan NT1	20.14664900	99.85711251	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
643	CRI_GPON-FH Maesalongnok NT1	20.16188200	99.64857545	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
644	NT1_CRI_GPON-FH Janjawa	20.23076380	99.95586291	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
645	cr-bphd-ol-f554-1(บ้านผาฮี้)	20.35074000	99.82760375	NT1	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
646	CRI_GPON FH Maiya NT1	19.73486000	100.11224500	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
647	CRI_GPON-FH เทิง NT1	19.68317440	100.19658254	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
648	CRI_GPON-FH Mae Khachan NT1	19.20774870	99.51725677	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
649	สค.เชียงราย#3 XGPON	19.91000000	99.82570000	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
650	CRI_GPON FH Srimingkaow NT1	19.87794330	99.79018634	NT1	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
651	CRI_GPON-FH Phan NT1	19.54979810	99.74912231	NT1	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
652	cri-ws12-24k01(บ้านเวียงสัก ม.12)	19.89756300	100.23220600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
653	cri-dng15-24k01(บ้านดอยงาม ม.15)	19.50908000	99.33985000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
654	cri-tong2-24k01(บ้านต้นง้าว หมู่ 2)	19.81624516	99.73371154	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
655	cri-swmn7-24k01(บ้านศรีวังมูล ม.7)	19.80791392	99.75546245	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
656	cri-dknn7-24k01 (บ้านดงขนุน ม. 7)	19.69345444	99.66246743	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
657	cri-npug4-24k01(บ้านหนองผักจิก ม.4)	19.65240600	99.71380600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
658	cri-huym6-24k01(บ้านห้วยเม็ง ม.6)	20.29807062	100.38337000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
659	cri-pchg-bigrock-01(โป่งช้าง)	19.64291100	99.95996250	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
660	cri-ponp-bigrock-01(โป่งผา)	20.36662479	99.88405650	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
661	cri-jpno-bigrock-01(จะพะน้อย)	20.23858300	99.65116300	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
662	cri-molo-bigrock-01(มอล่อง)	20.21180630	99.64171250	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
663	cri-dci6-24k01 (บ้านดอนไชย ม.6)	19.66053057	100.28777593	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
664	cri-mklg-bigrock-01(ม้งเก้าหลัง)	20.34014020	99.52225230	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
665	cri-bklg-bigrock-01(บ้านกลาง)	20.15702985	99.65532719	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
666	BR_หล่อโย	20.12010001	99.59103873	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
667	cri-saye-bigrock-01(สามแยกอีก้อ)	20.16634120	99.71118920	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
668	cri-hsam-bigrock-01(ห้วยส้านใหม่)	20.23631780	99.77352920	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
669	cri-huri-bigrock-01(ห้วยไร่)	20.26656271	99.84221496	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
670	BR_ดอยล้าน	19.76643000	99.55657360	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
671	cri-bynm-bigrock-01(ย่านำ)	19.85955490	99.50369650	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
672	cri-dind-bigrock-01(ดินดำ)	19.54185070	99.49111810	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
673	cri-ydmp-bigrock-01(แยกดอยม่อนป่าก๋อย)	19.64971510	99.46682334	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
674	cri-mng15-24k01(บ้านม่วง ม.15)	19.69819800	100.29363800	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
675	cri-ptng-bigrock-01(ป่าตึงงาม)	19.30984370	99.41030640	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
676	cri-khje-bigrock-01(ขุนแจ)	19.32811750	99.31868420	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
677	cri-rpti-bigrock-01(ร่มโพธิ์ไทย)	19.78448000	100.40009000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
678	BR_ฟ้าไทยงาม	19.85798200	100.43334580	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
679	cri-hfto-bigrock-01(หัวฝายตับเต่า)	19.76256530	100.31503900	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
680	cri-ymtm-bigrock-01(เย้าแม่ต๋ำ)	19.99594930	100.16990480	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
681	cri-ngjr-bigrock-01(หนองงามเจริญ)	19.19262201	99.50688241	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
682	cri-pypp-bigrock-01(พญาพิทักดิ์)	19.86683750	100.33758700	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
683	cri-hspp-bigrock-01(ห้วยส้านพลับพลา)	19.78938210	99.65837431	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
684	cri-mgkn-bigrock-01(เมืองกาญจน์)	20.34777700	100.35038930	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
685	cri-hsk1-24k01(บ้านห้วยสัก ม.1)	20.14982962	100.11749913	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
686	cri-wawe-bigrock-01(วาวี)	19.92355797	99.49020397	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
687	cri-msl-bigrock-01(แม่สะลอง)	20.16817600	99.62509160	DE	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
688	cri-psk11-24k01(บ้านผ่านศึก ม.11)	20.13756051	100.06843510	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
689	cri-rmk9-24k01(บ้านร่มแก้ว ม.9)	20.09523000	100.07931000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
690	 บ้านห้วยเคียน ม.5	19.95528023	100.00014222	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
691	cri-wkg11-24k01(บ้านเวียงกลาง ม.11)	20.09174097	99.97433953	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
745	cri-chpk5-24k01 (บ้านชัยพฤกษ์ ม.5)	19.77274870	100.00485230	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
692	cri-khp17-24k01(บ้านขุนห้วยแม่เปาใต้ ม.17)	19.96372000	100.13695000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
693	cri-mcm7-24k01(บ้านม่วงชุม ม. 7)	20.10130316	100.40299442	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
694	cri-tnn11-24k01(บ้านทุ่งนาน้อย ม.11)	20.26154395	100.34259095	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
695	cri-nsb8-24k01(บ้านเนินสมบูรณ์ ม.8)	20.07512504	100.25957536	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2970	lpg_art_fttx	18.30737000	99.51114300	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
696	cri-wm10-24k01(บ้านเวียงหมอก ม.10)	20.11334778	100.30075735	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
697	cri-pit16-24k01	20.19151700	100.45121300	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
698	cri-ltt13-24k01(บ้านรักถิ่นไทย ม.13)	19.80258125	100.35100487	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
699	cri-tsng9-24k01(บ้านทุ่งสง่า ม.9)	19.59267451	100.10657108	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
700	cri-hlk4-24k01(บ้านห้วยลึก ม.4)	20.15552300	100.54176500	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
701	cri-tkm2-24k01(บ้านทุ่งคำ ม.2)	20.08308400	100.47289600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
702	cri-hlk2-24k01 (บ้านห้วยแล้ง ม.2)	20.02146800	100.48164000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
703	cri-sth12-24k01(บ้านสันต้นแหน ม.12)	19.92744052	99.90219364	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
704	cri-mkn7-24k01(บ้านใหม่กือนา ม.7)	19.96358000	99.94471000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
705	cri-ntp7-24k01(บ้านน้ำตกพัฒนา ม.7)	19.97341000	100.06541000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
706	cri-pat6-24k01(บ้านป่าตึง ม.6)	20.05482000	99.99026000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
707	cri-smm1-24k01(บ้านสมานมิตร ม.1)	19.81846691	99.95655341	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
708	cri-wao6-24k01(บ้านวังอวน ม.6)	19.46119000	100.01918000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
709	cri-hkr12-24k01(บ้านห้วยข่อยหล่อย ม.12)	20.19542000	100.23892000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
710	cri-std4-24k01(บ้านสันธาตุ ม.4)	20.21324000	100.09759000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
711	cri-mbo7-24k01(บ้านแม่บง ม.7)	20.10701700	100.16823600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
712	cri-npk-24k01(บ้านหนองป่าก่อ)	20.17222090	100.11431200	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
713	cri-pat12-24k01(บ้านผาแตก ม.12)	20.13721000	99.95390000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
714	cri-rke1-24k01(บ้านร่องคี ม.1)	20.17653000	99.83761000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
715	cri-ansk-24k01 (รร.อนุบาล ศรีค้ำ)	20.20851600	99.85820100	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
716	cri-wsa7-24k01(บ้านเวียงสา ม.7)	20.21980300	99.82686300	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
717	cri-nik9-24k01(บ้านนิคม ม.9)	20.18037000	99.77125169	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
718	cri-dtr3-24k01 (บ้านดอยต่อ ม.3)	20.18222000	99.91248000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
719	cri-ttho11-24k01(บ้านธารทอง ม.11)	20.28571000	100.25836000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
720	cri-law6-24k01(บ้านแหลว ม. 6)	20.16245000	99.88322000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
721	cri-hhm9-24k01 (บ้านฮ่องแฮ่ใหม่ ม. 9)	20.27467000	99.90878000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
722	cri-ekor4-24k01 (บ้านอีก้อสี่หลัง ม.4)	20.26094100	99.79629800	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
723	 บ้านโป่งนาคำ ม.4	19.94822040	99.72647160	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
724	cri-rmit2-24k01(บ้านรวมมิตร ม. 2)	19.95919973	99.71282633	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
725	cri-tugk6-24k01(บ้านทุ่งเกลี้ยง ม.6)	20.37159500	100.00012600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
726	cri-hps12-24k01(บ้านห้วยประสิทธิ์ ม.12)	19.54188200	99.70417200	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
727	cri-tut13-24k01(บ้านทุ่งต่าง ม.13)	20.10965275	99.75322147	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
728	cri-tpg13-24k01(บ้านทุ่งผักกูด ม.15)	19.55909000	99.67650000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
729	cri-mama1-24k01(บ้านแม่มะ ม.1)	20.35815700	100.00095000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
730	cri-hmk18-24k01(บ้านห้วยหมาก ม.18)	20.22161000	99.57532100	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
731	cri-laol14-24k01(บ้านเล่าลิ่ว ม.14)	20.27630600	99.59415100	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
732	 บ้านทูหมออาเน ม.17	20.24078800	99.71211600	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
733	cri-paj10-24k01(บ้านผาจ้อ ม.10)	19.60237200	99.69047100	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
734	cri-spke5-24k01(บ้านสันผักแค ม.5)	19.51233449	99.76675417	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
735	cri-dwng8-24k01 (บ้านดงเวียง หมู่ 8)	19.45754000	99.82566000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
736	cri-stp10-24k01(บ้านสันต้นผึ้ง)	19.49918800	99.74190800	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
737	cri-djr13-24k01 (บ้านดอยเจริญ ม.13)	19.60094000	99.79610000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
738	cri-hkba6-24k01(ห้วยเครือบ้า)	19.61857521	99.91147281	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
739	cri-dng8-24k01 (บ้านดอยงาม ม.8)	20.23612400	100.05342500	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
740	cri-hsak5-24k01(บ้านห้วยสัก ม.5)	19.55486100	99.86279400	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
741	cri-mtar7-24k01(บ้านใหม่ท่าเรือ ม.7)	19.57847848	99.86109566	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
742	cri-huyh5-24k01(บ้านห้วยเฮี๋ย ม.)	19.59117500	99.46309200	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
743	cri-pkm14-24k01(บ้านปุยคำ ม.14)	19.77051502	99.80397724	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
744	cri-nba5-24k01(บ้านหนองบัว ม.5)	19.78847000	100.17758000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
746	cri-pgi15-24k01(บ้านผาจี ม.15)	20.30278400	99.65737900	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
747	 บ้านเล่าฟู่ ม.20	20.10927200	99.68632300	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
748	cri-thup7-24k01(ทุ่งพร้าว)	19.75427183	99.49892045	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
749	cri-ppk16-24k01(บ้านโป่งป่าแขม ม.16)	19.71968781	99.60474245	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
750	cri-hsy13-24k01(ห้วยส้านยาว ม.13)	19.74387800	99.64756300	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
751	cri-pnok6-24k01(บ้านโป่งนก ม.6)	19.43095047	99.49028000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
752	cri-paoi9-24k01(บ้านปางอ้อย หมู่ 9)	19.61141000	99.55886041	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
753	cri-bra19-24k01 (บ้านบาหรา ม. 19)	19.50367000	99.40831000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
754	cri-hpl13-24k01(บ้านห้วยโป่งผาลาด หมู่ 13)	19.11274000	99.45811000	DE	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
755	เชียงของ	20.24632058	100.41118203	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
756	เทิง	19.68768692	100.19034858	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
757	แม่จัน	20.14648957	99.85759951	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
758	พาน	19.54935097	99.74732494	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
759	เวียงป่าเป้า	19.34427860	99.50842521	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
760	ท่าสาย	19.86516512	99.83841096	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
761	ห้วยไคร้ FTTx	20.26509929	99.85999029	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
762	เทอดไทย	20.23882698	99.66721919	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
763	แม่ขะจาน	19.19452390	99.53300752	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
764	เวียงชัย FTTx	19.88277134	99.93196934	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
765	เวียงเชียงรุ้ง FTTx	20.00754182	100.04321313	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
766	ท่าข้าวเปลือก	20.16483384	100.00226223	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
767	หนองบัวแดง	20.02121151	99.93538296	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
768	แม่สรวย FTTx	19.65880355	99.53776978	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
769	บ้านต้า Fttx	19.81540153	100.24188988	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
770	มหาวิทยาลัยแม่ฟ้าหลวง	20.04641629	99.87722101	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
771	เวียงแก่น	20.10876855	100.52187211	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
772	แม่ลาว	19.72057130	99.71635646	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
773	ดอยแม่สะลอง FTTx	20.16797354	99.62601955	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
774	ปล้อง	19.65125000	100.09028100	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
775	แม่ยาว	19.96729077	99.77122348	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
776	แม่คำ	20.22722827	99.85633842	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
777	เด่นห้า	19.90287697	99.81503731	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
778	แม่อ้อ	19.66088349	99.85191132	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
779	ท่าก๊อ	19.49618058	99.47376562	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
780	บ้านด้าย	20.29171941	99.94998448	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
781	หงาว	19.67442508	100.25692575	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
782	พญาเม็งราย	19.84704952	100.15374275	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
783	วาวี	19.93194652	99.49031061	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
784	ดอยช้าง	19.81256362	99.56393857	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
785	สบรวก	20.34635672	100.08269419	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
786	หัวง้ม	19.51389802	99.79427467	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
787	ดอยลาน	19.66613589	99.93125053	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
788	ม่วงคำ	19.50698380	99.74620270	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
789	ไม้ยา	19.73173740	100.11289453	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
790	ดอยหลวง	20.11825299	100.09873364	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
791	เวียงเหนือ	19.93860626	99.94459895	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
792	ร่องขุ่น	19.82295397	99.76571702	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
793	แม่ลอย ม.8 Fttx	19.58049016	100.04685641	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
794	แม่เปา Fttx	19.89232378	100.10971835	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
795	แม่ข้าวต้ม	20.07499656	99.87552642	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
796	น้ำลัด	19.93176036	99.81485015	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
797	ศูนย์ราชการ เชียงราย	19.93006597	99.86177426	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
798	เกาะช้าง	20.42056600	99.98258940	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1041	CMI_ONT3_01_(ออนใต้ ม.3)	18.73477686	99.20769483	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1042	CMI_RPTP_01_(โรงพักช้างเผือกเก่า)	18.82991477	98.97801474	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
799	สถาน	20.21293645	100.40014005	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
800	MaeKhaoTom7 แม่ข้าวต้ม ม.7	20.09154217	99.97435814	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
801	-USO1149 หนองเตา	19.90341272	100.41744834	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
802	-USO1157 แม่ปูนล่าง	19.41192584	99.45163009	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
803	-USO1076 ปางขอน (ห้วยมะเลี่ยม)	19.89894519	99.61886968	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
804	-USO1055 สองพี่น้อง	20.39688837	100.30586205	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
805	-USO1139 ดอยผาตั้ง	19.93592000	100.51047300	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
806	ศรีดอนชัย ม.10	20.13351000	100.42338500	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
807	บ้านโล๊ะ	20.02957852	100.49302245	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
808	เวียง ม.8	19.75266230	100.22902596	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
809	 ป่าซาง (เวียงเชียงรุ้ง)	20.03463053	100.11457867	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
810	เชียงราย	19.90961060	99.83889032	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
811	บ้านดู่เมืองใหม่	19.97762374	99.86163291	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
812	ดงมหาวัน	20.02303858	100.01299000	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
813	แยกบ้านเด่น	20.00689640	99.86747860	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
814	Airport ท่าอากาศยานเชียงราย	19.95903535	99.88105131	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
815	 ปางเกาะทราย	19.50637059	99.66272852	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
816	 ตับเต่า	19.74031655	100.30032883	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
817	 โป่งแดง	19.65122388	99.73647988	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
818	เวียงกาหลง	19.23268500	99.49688700	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
819	แม่แอบ	20.19108000	100.22448700	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
820	เมืองชุม ม.2 Fttx	19.91888700	99.98730500	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
821	 โป่งผา	20.36537399	99.88503735	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
822	ดอยงาม	19.57186423	99.83060783	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
823	เคหะชุมชนเชียงราย Fttx	19.84627167	99.80311519	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
824	เชียงเคี่ยน	19.61428336	99.99401874	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
825	ปางหมอปวง	20.28368000	100.01508700	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
826	เจริญเมือง	19.60861438	99.75826707	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
827	ทุ่งยั้ง	19.90902910	100.07353014	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
828	โล๊ะป่าตุ้ม	19.68251057	99.97390139	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
829	ร่องธาร	19.68584516	99.70157749	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
830	อำเภอขุนตาล	19.83231435	100.25899416	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
831	ศรีดอนชัย ม.8	19.61047429	100.08772964	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
832	DoiHang	19.92019347	99.76243293	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
833	ห้วยส้ม	19.58274942	99.49291864	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
834	แม่เจดีย์ใหม่	19.15221000	99.50011500	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
835	แคววัวดำ	19.97610455	99.65460306	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
836	ห้วยแม่เลี่ยม	19.91729296	99.62195455	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
837	แม่ตะละ	19.46934000	99.56192300	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
838	แม่ยางมิ้น	19.60337000	99.38480000	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
839	ป่าก่อดำ	19.79200028	99.70451648	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
840	แม่สาย FTTx	20.42940513	99.88439418	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
841	สถาบันราชภัฎเชียงราย FTTx	19.98102700	99.84982900	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
842	จันจว้า	20.21763933	99.94118387	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
843	บุญเรือง	20.00908525	100.35028443	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
844	HuaiSaK ห้วยสัก	19.77787863	99.91060874	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
845	แม่กรณ์	19.83725511	99.70960063	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
846	BanPaSak บ้านป่าสัก	19.74747665	99.72196970	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
847	ขุนตาล	19.92239820	100.30532405	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
848	HuaiSor3 ห้วยซ้อ ม.3	20.04660595	100.29160870	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
849	SanMaKet สันมะเค็ด	19.60227918	99.83412886	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
850	ดอนศิลา	19.82413416	100.02010054	NT2	เชียงราย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
851	แม่ต๋ำ 11	19.95052680	100.25005441	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
852	MaeNgoen6 แม่เงิน ม.6	20.30253511	100.22804232	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
853	BanSaw6 บ้านแซว ม.6	20.23786877	100.16366615	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
854	ป่าอ้อดอนชัย	19.87273977	99.78124982	NT2	เชียงราย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
855	NT1_ แม่แจ่ม	18.49400000	98.36330000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
856	NT1_ สะเมิง	18.85080102	98.73266155	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
857	NT1_แม่ออน	18.74000000	99.20720000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
858	NT1_ ดอยเต่า	17.95304180	98.68174315	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
859	NT1_หางดง	18.67100000	98.91550000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
860	NT1_สันป่าตอง	18.62000000	98.89790000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
861	NT1_บ้านกาด	18.60800000	98.82350000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
862	 _NT1_ท่าลี่	18.45176400	98.74766737	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
863	NT1_บ่อสร้าง	18.76600000	99.08260000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
864	NT1_สันกำแพง	18.74000000	99.11940000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
865	NT1_สารภี	18.71300000	99.03380000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
866	NT1_เชียงใหม่ 4	18.76870639	98.97960331	NT1	เชียงใหม่	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
867	NT1_พระสิงห์	18.78391000	98.98158100	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
868	NT1_ช้างคลาน	18.77694000	98.99710900	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
869	NT1_เมืองสมุทร	18.79856400	98.99820970	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
870	NT1_ศิริวัฒนา	18.80557000	98.98472100	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
871	NT1_ ฮอด	18.19379441	98.61037153	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
872	NT1_ อมก๋อย	17.79704800	98.35826895	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
873	NT1_ท่ามะแกง	20.06258000	99.44943900	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
874	NT1_แม่อาย	20.03000000	99.31040000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
875	NT1_ดอยอ่างขาง	19.89646000	99.04561900	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
876	NT1_ ต้นหนุน	19.91637000	99.21217900	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
877	NT1_สค.ฝาง	19.90200000	99.20120000	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
878	NT1_ม่อนปิ่น	19.91136000	99.17384800	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
879	NT1_แม่สูน	19.82945000	99.16533600	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
880	NT1_สันต้นหมื้อ	19.95916000	99.28267000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
881	NT1_สค.เชียงใหม่ 1	18.77740000	99.02692800	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
882	NT1_เสียงสามยอด	18.84400000	99.01660000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
883	NT1_แม่โจ้	18.89700000	99.00580000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
884	NT1_สันทราย	18.85100000	99.04110000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
885	NT1_ศรีวิชัย	18.80753800	98.95776330	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
886	NT1_สนามกีฬา 700 ปี	18.84000000	98.95630000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
887	NT1_บ้านไร่ยามเย็น	18.81200000	99.00690000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
888	NT1_หลังมอชอ	18.79200400	98.95680840	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
889	NT1_แยกสะเมิง	18.71900000	98.95400000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
890	NT1_แม่เหียะ	18.74500000	98.94260000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
891	NT1_ไชยปราการ	19.75293700	99.14702400	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
892	NT1_ศรีดงเย็น	19.66420000	99.14389600	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
893	NT1_จอมทอง	18.42400391	98.68181288	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
894	NT1_แม่ริม	18.90700000	98.94720000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
895	NT1_โป่งแยง	18.89033000	98.83206300	NT1	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
896	NT1_บ้านปางกว้าง	19.17400000	98.95040000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
897	NT1_แม่แตง	19.09800000	98.93620000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
898	NT1_เชียงดาว	19.36600000	98.96580000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
901	NT1_โล๊ะป่าหาญ	19.61700000	98.95599000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
902	NT1_ฟ้าธานี	18.79747000	98.97118100	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
903	cmi-pjd6-24k01 (บ้านแพะเจดีย์ หมู่ 6)	18.96975420	98.98335761	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
904	cmi-bpm1-24k01 (บ้านสบแปะ หมู่ 1)	18.24239266	98.60421668	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2971	LPG_BAN SAA	18.64275367	99.53911773	NT2	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
905	cmi-nkr2-24k01 (บ้านนาคอเรือ หมู่ 2)	18.06853320	98.54816591	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
906	cmi-tpo4-24k01 (บ้านทุ่งโป่ง หมู่ 4)	18.13333683	98.64214050	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
907	cmi-mtm5-24k01 (บ้านแม่ตูบ หมู่ 5)	17.90419072	98.78097392	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
908	cmi-pnm2-24k01 (บ้านผานัง หมู่ 2)	18.50123716	98.40951393	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
909	cmi-tym1-24k01 (บ้านทุ่งยาว หมู่ 1)	18.55128117	98.39248219	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
911	cmi-ttm5-24k01 (บ้านต้นตาล หมู่ 5)	18.53447173	98.35030142	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
912	cmi-bsr6-24k01 (บ้านบ่อสลี หมู่ 6)	18.10623631	98.22049377	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
913	cmi-mlt6-24k01 (บ้านแม่ลายใต้ หมู่ 6)	18.09032315	98.36347854	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
914	cmi-ybt2-24k02 (บ้านยางเปาใต้ ม.2)	17.82302850	98.31927805	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
915	cmi-ykm7-24k02 (บ้านยางคก ม.7)	17.79695380	98.46090800	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
916	cmi-prm5-24k01 (บ้านป่าลัน หมู่ 5)	19.37819698	99.15733531	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
917	cmi-mtt7-24k01 (บ้านแม่เตี๊ยะใต้ หมู่ 7)	18.40388072	98.65144076	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
918	cmi-bpo1-24k01 (บ้านโป่ง ม.1)	19.37391779	99.17363344	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
919	cmi-ksp6-24k01 (บ้านขามสุ่มป่า หมู่ 6)	19.41043251	99.19544169	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
920	cmi-sp10-24k01 (บ้านสันตะผาบ ม.10)	19.39573360	99.20393149	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
921	cmi-lpl8-24k04 (บ้านโล๊ะปูเลย หมู่ 8)	19.40327726	99.21326436	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
922	cmi-tku2-24k01 (บ้านทุ่งกู่ ม.2)	19.36838863	99.22492604	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
923	cmi-sdl7-24k06 (บ้านสหกรณ์ดำริ หมู่ 7)	19.34418938	99.17651777	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
924	cmi-pdn9-24k01 (บ้านภูดิน ม.9)	19.12994562	99.05854256	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
925	cmi-mtm2-24k01 (บ้านแม่ตะมาน หมู่ 2)	19.20061936	98.88953896	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
926	cmi-smn5-24k01 (บ้านทรายมูล หมู่ 5)	19.05625529	98.94247482	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
927	cmi-hn17-24k01 (บ้านหาดนาค หมู่ 17)	18.34744798	98.68016788	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
928	cmi-phl3-24k01 (บ้านปางแหว หมู่ 3)	18.92313613	98.90913625	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
929	cmi-paf5-24k01 (บ้านปางแฟน หมู่ 5)	18.99638895	99.28061304	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
930	cmi-mhn2-24k01 (บ้านแม่ฮ้อยเงินใต้ หมู่ 2)	18.81161944	99.14625017	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1155	NT1_ไปรษณีย์ตาก	16.88183000	99.12475770	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
931	cmi-tyo8-24k01 (บ้านทุ่งยาว หมู่ 8)	18.86757441	99.17249274	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
932	cmi-pb10-24k01 (บ้านพระบาท หมู่ 10)	18.89425586	99.09515959	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
933	cmi-mtd1-24k01 (บ้านแม่ตาด หมู่ 1)	18.78697340	99.17396474	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
934	cmi-bjn7-24k01 (บ้านบวกจั่น หมู่ 7)	18.86189094	98.78421259	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
935	cmi-kkl7-24k01 (บ้านกองขากหลวง หมู่ 7)	18.91627796	98.72150025	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
936	cmi-kkn8-24k01 (บ้านกองขากน้อย หมู่ 8)	18.88773013	98.68333775	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
937	cmi-pj11-24k01 (บ้านป่าจี้ หมู่ 11)	19.79506225	99.14334681	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
938	cmi-br21-24k01 (บ้านไร่สว่างอารมณ์ หมู่ 21)	18.49365866	98.77950153	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
939	CMI_MKI7_01	19.08556341	98.68358596	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
940	cmi-pyn1-24k01 (บ้านป่ายางหนาด หมู่ 1)	19.06879235	98.72491229	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
941	cmi-pk16-24k01 (บ้านปางกึ๊ด หมู่ 16)	19.26104130	98.92170600	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
942	cmi-mon8-24k01 (บ้านแม่อ้อใน หมู่ 8)	19.31912900	98.95615895	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
943	cmi-pl16-24k01 (บ้านผาลาย ทุ่งหลุก)	19.34974666	99.01500282	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
944	cmi-nk12-24k01 (บ้านหนองเขียว หมู่ 12)	19.70120767	98.94381628	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
945	cmi-poa5-24k01 (บ้านโป่งอ่าง หมู่ 5)	19.60764700	98.95655945	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
946	cmi-map8-24k01 (บ้านแม่แพม หมู่ 8)	19.56564091	98.63169714	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
947	cmi-dpr2-24k01 (บ้านดงป่าลัน หมู่ 2)	19.78502838	99.16360000	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1199	tak-ppa8-24k01	16.44115429	98.70165711	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
948	cmi-tp11-24k01 (บ้านถ้ำผาผึ้ง หมู่ 11)	19.72872278	99.12217094	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
949	cmi-npc8-24k01 (บ้านหนองป่าซาง หมู่ 8)	19.72557443	99.17324168	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
950	cmi-tt13-24k01 (บ้านถ้ำตับเต่า หมู่ 13)	19.66381814	99.14325020	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
951	cmi-ptd9-24k01 (บ้านปางต้นเดื่อ หมู่ 9)	20.08947304	99.28842964	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
952	cmi-jsn7-24k01 (บ้านจัดสรร หมู่ 7)	19.92082820	99.28179219	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
953	cmi-hki5-24k01 (บ้านห้วยไคร้ หมู่ 5)	19.81512888	99.21820955	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
954	cmi-dcn3-24k01 (บ้านดอนชัยเหนือ หมู่ 3)	20.02075061	99.27184251	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
955	cmi-mak1-24k01 (บ้านแม่คะ หมู่ 1)	19.85232335	99.20418069	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
956	cmi-ymn3-24k01 (บ้านยั้งเมิน หมู่ 3)	18.98362370	98.57390099	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
957	cmi-tk10-24k01 (บ้านท่ากอม่วง หมู่ 10)	18.20833789	98.63554682	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
958	cmi-rm14-24k01 (บ้านหลังม่อน หมู่ 14)	18.45756925	98.77451791	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
959	cmi-mts8-24k01 (บ้านใหม่ทุ่งสน หมู่ 8)	18.15320317	98.28810029	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
960	cmi-wlg4-24k01 (บ้านวังหลวง หมู่ 4)	17.98211819	98.68589483	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
961	cmi-sts7-24k01 (บ้านสันติสุข หมู่ 7)	17.92107248	98.72395456	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
962	 BigRock บ้านหลวง	18.52958859	98.60897591	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
963	cmi-pdd2-24k01 (บ้านแพะดินแดง หมู่ 2)	18.11062567	98.60578693	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
964	 BigRock บ้านแกน้อย	19.67820130	98.78116430	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
965	 BigRock บ้านปางกลาง	19.51454988	98.78640967	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
966	 BigRock บ้านพุย	18.03849980	98.30302999	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
967	CMI_BMKG_01_(บ้านเมืองคอง)	19.38348980	98.71756409	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
968	 ฺBigRock ยางเปียง	17.77823000	98.48716000	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
969	 บ้านแม่ลานหลวง	17.73373686	98.35577023	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
970	 BigRock แม่หลองหลวง	17.68524868	98.25363319	DE	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
971	แม่แรม	18.91919878	98.91050943	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
972	 (แม่ปูคา)	18.78593283	99.12841824	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
973	CMI_FAN_01_(ฝาง)	19.91974492	99.20746379	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
974	ดอยอ่างขาง_DAK	19.91974167	99.04817396	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
975	 TOT ท่าตอน	20.05810921	99.35868305	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
976	cmi_ssi_04_(สันทรายZTE)	18.84276075	99.04360028	NT2	เชียงใหม่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
977	CMI_MRM_01_(แม่ริม)	18.91817836	98.95133156	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
978	CMI_BOS_01_(บ่อสร้าง)	18.76820000	99.06898000	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
979	CMI_MTG_01_(แม่แตง)	19.12122061	98.94249909	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
980	CMI_CMI3_03_(เชียงใหม่ 3/3)	18.79504548	99.01826340	NT2	เชียงใหม่	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
981	CMI_OP_01_(ออร์คิดเพลส)	18.82772071	99.05536705	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
982	cmi_pjp7_01_ปางจำปี ม.7	18.90267827	99.28620444	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
983	cmi_ptg5_01_พงษ์ทอง ม.5	18.93303255	99.34745882	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
984	CMI_RKL_01_(ร้องขี้เหล็ก)	18.85723106	99.10266638	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
985	CMI_TKP7_01_(ทุ่งข้าวพวง ม.7)	19.55238109	98.95807773	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
986	cmi_mtk1_01_บ้านแม่ตะไคร้ หมู่ 1	18.71864410	99.30041654	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
987	ห้วยทราย ม.2_HSI2	18.95772561	98.92070532	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
988	CMI_WASK_01_(วัดสันโค้ง)	18.74172642	99.16132480	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
989	ห้วยจะค่าน_HJK9	19.60404665	99.07054137	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
990	CMI_BMPK_01_(บ้านแม่ปาคี)	19.51376442	99.17215373	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
991	CMI_POYG_01_(โป่งแยง)	18.88413544	98.82028193	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
992	CMI_MPAM3_01_(บ้านแม่ป๋าม หมู่ 3)	19.44186078	99.02970701	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
993	cmi_nhlg_01_(หนองห้วยลึก)	19.53720995	99.05452111	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
994	cmi_boke_01_(บ่อแก้ว ม.5)	18.84884729	98.56376905	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
995	cmi_pln4_01_(ป่าลาน ม.4)	18.96830441	98.72621769	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
996	USO_ปางเติม ม.4_สะเมิง	18.94617197	98.67531765	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
997	cmi_mky2_01_(เมืองก๋าย ม.2)	19.17701505	98.80946747	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
998	cmi_nhk4_01_(บ้านหนองก๋าย ม.4)	19.03138007	98.86569672	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
999	เมืองนะ ม.10 (FTTx)	19.73659661	98.96398894	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1000	CMI_TPYHP_01_(เชียงใหม่ 3 Cab#055 รพ.เทพปัญญา)	18.81002813	99.01119620	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1001	CMI_PHR_01_(พร้าว)	19.36423289	99.20060538	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1002	CMI_MJO_01_(แม่โจ้)	18.89124261	99.01541762	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1003	CMI_SKP_01_(สันกำแพง)	18.75085473	99.11345866	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1004	CMI_DOS_01_(ดอยสะเก็ด)	18.87700000	99.14052000	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1005	CMI_CPKN_01_(ไชยปราการ)	19.73174923	99.14236657	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1006	CMI_NOGH_01_(เคหะหนองหอย)	18.75995179	99.00730508	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1007	CMI_BPT_01_(บ้านปากทาง)	19.14155396	98.94822805	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1008	CMI_KEL9_01_(ขี้เหล็กจอมแจ้ง)	19.05650889	98.92907776	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1009	CMI_CAB015_01_(เชียงใหม่ 3 Cab#015)	18.77394198	99.02844646	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1010	CMI_MAN_01_(แม่ออน)	18.77626390	99.24994308	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1011	CMI_MAI_01_(แม่อาย)	20.03798746	99.30287114	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1012	CMI_SMG_01	18.85094431	98.73228073	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1013	 ม่อนปิ่น (FTTx)	19.91275442	99.16746706	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1014	CMI_WHG_01_(เวียงแหง)	19.56229368	98.63929262	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1015	cmi_hyk3_01_บ้านห้วยแก้ว หมู่ 3	18.85956595	99.27702069	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1016	CMI_BUKG_01_(บวกค้าง)	18.70563000	99.10690800	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1017	CMI_MNGIT_01_(เมืองงาย)	19.46170031	98.96436081	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1018	 เจดีย์แม่ครัว	18.97884705	98.98137532	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1019	 สันกลาง ม.1 (FTTx)	18.79605834	99.04588938	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1020	CMI_MHP_01_(แม่หอพระ)	19.11111000	99.01817100	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1021	CMI_KAKN_01_(กาญจน์กนก 1)	18.73878319	99.07553821	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1022	 แม่รวม	18.81953880	99.30233926	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1023	ห้วยทราย สันกำแพง	18.78776012	99.16371346	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1024	CMI_SRR2_01_(สำราญราษฎร์ ม.2)	18.81000000	99.09760000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1025	 สันทรายcab#006	18.81158984	99.02910000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1026	CMI_TLY2_(ตลาดใหญ่ ม.2)	18.81030000	99.12190000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1027	CMI_MSAN047CMI3_01_(CMI3_Cab047)	18.78699314	99.00935452	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1028	CMI_CMI3CAB043_01_(เชียงใหม่ 3 Cab#043 หน้าสารสาสน์)	18.78424047	99.02247221	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1029	CMI_SNK5_01_(สันกลาง ม.5)	18.76347827	99.05494277	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1030	CMI_PEFH_01_(เพอร์เฟกโฮม)	18.75800907	99.04754780	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1031	CMI_SPL7_01_(สันปูเลย ม.7)	18.80409716	99.06241715	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1032	CMI_NOPK_01_(หนองป่าครั้ง)	18.78557436	99.03705902	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1033	สันโป่ง_SAPO	18.95048000	98.94568900	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1034	CMI_TLK_01_(ตลาดขวัญ ม.5)	18.84755046	99.08167657	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1035	บ่อสร้าง Cab#001	18.77555498	99.05947745	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1036	CMI_PAP2_01_(ป่าไผ่ ม.2)	18.89600000	99.04930000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1037	CMI_CMI3CAB031_01_(เชียงใหม่ 3 Cab#031 สันกู่เหล็ก)	18.80258832	99.01175056	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1038	เชียงดาว_CDO	19.37324620	98.96454148	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1039	CMI_MUKA_01_(เหมืองแก้ว)	18.91862239	98.97497833	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1040	 TOT บ้านในฝัน 4	18.71776754	99.13883716	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1200	tak-wal3-24k01	16.29989080	98.71087978	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1043	CMI_CMI3CAB027_01_(เชียงใหม่ 3 Cab#027)	18.82662195	99.01200086	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1045	CMI_RSS3_01_ (ภาคขายและบริการภูมิภาค ที่ 3)	18.69427446	99.05106200	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1046	cmi_baap_01_(มบ.เอื้ออาทรป่าตัน)	18.84260000	98.98534000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1047	CMI_WACM_01_(วัดเชียงมั่น)	18.79344678	98.98879454	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1048	CMI_AMPM_01_(อำเภอเมือง)	18.79072218	98.98424953	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1049	CMI_DST_01_(ดอยสุเทพ)	18.80293920	98.92053754	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1050	CMI_CHTA_01_(โชตนา ซ.6)	18.81483403	98.98322403	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1051	CMI_STT1_01_(สันติธรรม)	18.80135412	98.98161292	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1052	CMI_KSCP_01_(ขนส่งช้างเผือก)	18.80085297	98.98607950	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1054	cmi_cmgc_03_(ศูนย์ราชการเชียงใหม่ ZTE)	18.84067322	98.96928899	NT2	เชียงใหม่	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1055	CMI_FHM2_01_(ฟ้าฮ่าม ม.2)	18.81486224	99.00354654	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1056	CMI_HOMA_01_(โฮมมอลล์)	18.84785302	99.01226823	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1057	cmi_bnch_01_บ้านช้าง (Huawei)	19.15072293	98.85824569	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1059	cmi_mpg_01_(แม่ปั๋ง_Huawei)	19.23654571	99.18455273	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1060	 บ้านนาเม็ง (FTTx) Huawei	19.11160792	99.17977840	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1061	 ป่าแป๋ (FTTx) Huawei	19.12152900	98.70860300	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1062	 สันผีเสื้อ (FTTx) Huawei	18.85384994	98.98648769	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1063	 แม่ข่า (FTTx) Huawei	19.80242309	99.16775138	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1064	หนองแหย่ง E001 (Huawei)_NNG-E001	18.89450341	99.09526419	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1065	 สันป่ายาง (FTTx) Huawei	19.04810717	98.86637569	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1066	 สันต้นหมื้อ	19.95715534	99.27227485	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1067	cmi_spp2_01_สันป่าเปา (Huawei)	18.85900000	99.08590000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1068	แม่สูน (Huawei)	19.83852162	99.17060525	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1069	CMI_BHKL_(บ้านห้วยข้าวลีบ-ห้วยหอย)	18.62921983	98.64084020	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1070	แม่งอน ม.12 (Huawei)_MN12	19.80372526	99.09889371	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1071	แม่วิน ม.11_MW11	18.66042723	98.66685421	NT2	เชียงใหม่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1072	cmi_nng_01_หนองแหย่ง	18.88629132	99.10181195	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1073	cmi_sppg_01_สบเปิง	19.10368021	98.83789063	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1074	cmi_mkp_01_(เมืองแกนพัฒนา)	19.14446026	99.01657135	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1075	cmi_oki_01_(อมก๋อย)	17.80020798	98.36175334	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1076	cmi_maw_01_(แม่วาง Huawei)	18.61365237	98.77340228	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1077	CMI_MTE_(แม่แต Huawei)	19.01358487	98.96056146	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1078	CMI_MATT_01_(แม่ทา)	18.60081525	99.27188278	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1079	CMI_DOPI_01_(ดอนปิน)	18.73720000	98.95512000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1081	CMI_SPHPA_01_(รพ.สันป่าตอง)	18.59845426	98.88865144	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1082	CMI_SPI_01_(สารภี)	18.70183000	99.04243417	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1083	น้ำแพร่ ม.4	18.68591462	98.89614941	NT2	เชียงใหม่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1084	CMI_SPT_01_(สันป่าตอง)	18.62788148	98.89766864	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1085	CMI_BNT_01_(บ้านกาด)	18.59960646	98.81682023	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1087	 มะขามหลวง (FTTx)	18.59426159	98.91282350	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1088	แม่โถ	18.25130275	98.20152666	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1089	CMI_BNH_01_(บ้านหนองห่าย)	18.45114731	98.72482614	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1090	CMI_CTG_01_(จอมทอง)	18.41806781	98.67551732	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1091	CMI_DTO_(ดอยเต่า)	17.96039000	98.68057900	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1092	CMI_BNSS_01_(แสนสราญ)	18.72171276	98.91562335	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1093	CMI_MCM_01_(แม่แจ่ม)	18.49691602	98.36478882	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1094	CMI_TR10_01_(ทุ่งรวงทอง ม.10)	18.56326575	98.83879667	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1096	CMI_CMIL_01_(เชียงใหม่แลนด์)	18.76879334	98.99878239	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1235	TOT_019	17.24548632	99.15553887	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1086	CMI_CAB002_01_(เชียงใหม่ 1 Cab002)	18.79610651	98.99661617	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1080	cmi_cmi1_01_(เชียงใหม่ 1)	18.78918334	99.00253497	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1097	CMI_WAUM_01_(วัดอุโมงค์)	18.79278770	98.95504511	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1098	CMI_STKN_01_(เศรษฐีกาญจน์)	18.72159832	99.02041376	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1099	 TOT แม่ก๊า	18.51985808	98.88421506	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1101	ตำรวจภูธร ภาค 5_PPR5	18.75845903	98.99902434	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2972	lpg_fttx_kka_03	18.19669741	99.40292440	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1102	CMI_BATW_01_(บ้านถวาย)	18.68959290	98.94593102	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1103	 บ้านขวัญเวียง 2_KWW2	18.71804039	98.96296346	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1104	cmi_emr1_01	18.74400000	98.94061700	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1105	CMI_WADC_01_(วัดดอนจืน)	18.73131214	99.02176411	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1106	CMI_WTPK_01_(วัดปากกอง)	18.67811000	99.04032000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1107	CMI_HDG_01_(หางดง)	18.71275399	98.93839922	NT2	เชียงใหม่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1108	CMI_HOT_01_(ฮอด)	18.19418590	98.61074968	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1109	 หนองตองพัฒนา (FTTx)	18.62283264	98.94012039	NT2	เชียงใหม่	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1110	CMI_BKG_01_(บ้านกลาง)	18.55742623	98.87451083	NT2	เชียงใหม่	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1111	CMI_NFK_01_(หนองแฝก)	18.69302423	99.02111466	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1112	 บ้านขุนกลาง (FTTx)	18.53708558	98.52129341	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1113	หนองตอง ม.9	18.60344376	98.93931300	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1095	น้ำซุ้ม_NSUM	18.77609151	98.85448546	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1114	CMI_MNC5_01_(แม่นาจร)	18.68323043	98.37859331	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1115	CMI_BAT9_01_(บ้านตาล)	18.10031007	98.68766552	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1116	CMI_NBL4_01_(น้ำบ่อหลวง ม.4)	18.64703199	98.86972309	NT2	เชียงใหม่	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1117	cmi_stw_01_(สันทรายมหาวงศ์)	18.64176693	98.95765048	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1118	CMI_B3L_(บ้านสามหลัง)	18.51698158	98.84411604	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1119	CMI_BASP_01_(บ้านแสงเพชร)	18.74905939	98.97953993	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1120	 ท่าวังพร้าว หมู่ 1 (FTTx)	18.53856817	98.86241943	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1121	CMI_BBS_01_(บ้านบุญส่ง)	18.73765486	98.99006936	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1122	CMI_PYCP_01_(พญาชมพู)	18.71700543	99.05433685	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1123	ห้วยม่วงฝั่งซ้าย_HMFS	18.25251924	98.72560708	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1124	CMI_KAKN3_01_(กาญจน์กนกวิลล์ 3)	18.73374558	98.99632067	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1125	CMI_DOCH_01_(ดอนชัย)	18.73887664	98.98035735	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1126	CMI_WATA_01_(บ้านวังตาล)	18.73414278	98.96470855	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1127	CMI_HKO2_01_(หารแก้ว)	18.64404256	98.92800093	NT2	เชียงใหม่	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1128	CMI_TSTK_01_(ทุ่งสะโตก)	18.59208000	98.84534400	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1129	CMI_CHST_01_(ไชยสถาน ม.3)	18.73500000	99.04307854	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1130	CMI_WPE_01_(ขังมุง ป่าเดื่อ)	18.67985366	98.98519755	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1131	CMI_KOVI_01_(กุลพันธ์วิลล์ 9)	18.69942014	98.94873292	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1132	CMI_MAS3_01_(แม่สอย ม.3)	18.28986189	98.64551816	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1133	cmi_nm16_01_(หนองมณฑา ม.16)	18.68803512	98.56705194	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1134	cmi_pl17_01_โป่งลมแรง ป่ากล้วย ม.17	18.64338858	98.52172781	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1135	CMI_SWK7_01_(บ้านสบวาก หมู่ 7)	18.64199399	98.37693310	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1136	cmi_phf_01_(ปางหินฝน)	18.50892487	98.23146154	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1137	cmi_khp12_01_(บ้านขุนปอน ห้วยวอก หมู่ 12)	18.44773223	98.26812633	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1138	cmi_mlg6_01_บ้านโม่งหลวง หมู่ 6)	18.36224857	98.43164683	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1139	cmi_yke8_01_(ยองกือ หมู่ 8)	17.97480867	98.38966549	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1140	cmi_uat6_01_(อูตูม หมู่ 6)	17.86116095	98.20984287	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1141	cmi_mhlg_01_(มะหินหลวง ม.19)	17.86897160	98.29834191	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1142	cmi_naki3_01_(นาเกียน หมู่ 3)	17.80531330	98.15274836	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1143	-บ้านหลวง ม.20	18.48586000	98.67092000	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1144	cmi_hld5_01_(บ้านห้วยหล่อดูก หมู่ 5)	17.41945937	98.45814092	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1145	แม่แฮเหนือ_MHN3	18.79077471	98.53052169	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1146	 บ่อหลวง(กิ่วลม)	18.14742848	98.34946842	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1147	CMI_BMA9_01_(บ้านเมืองอาง ม.9)	18.58521391	98.62349213	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1148	NT1_วังเจ้า	16.67523200	99.26463610	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1149	NT1_นาโบสถ์2	16.68554330	99.14659392	NT1	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1150	NT1_ปากทางเขื่อน	17.20497600	99.12790830	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1151	NT1_บ้านจัดสรร	17.20800000	99.05401000	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1152	NT1_บ้านตาก	17.04023700	99.07699720	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1153	NT1_หนองบัวเหนือ	16.93527000	99.06780900	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1154	NT1_บ้านโป่งแดง	17.05980000	99.27613000	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1156	NT1_พบพระ	16.39290000	98.69193000	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1157	NT1_อุ้มผาง	16.01827923	98.86592421	NT1	ตาก	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1158	NT1_ปะหละทะ	15.83836225	98.84992117	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1159	NT1_แม่ขมุน้อย	17.20597810	98.31352226	NT1	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1160	NT1_แม่ต้าน	17.22753000	98.22526110	NT1	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1161	NT1_แกละมื่อโจ๊ะ	17.22074000	98.29232800	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1162	NT1_ตาก2	16.89822000	99.12716250	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1163	NT1_บ้านลานสาง	16.79800000	99.03440000	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1164	NT1_บ้านประดาง	16.76500000	99.19210100	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1165	NT1_บ้านน้ำดิบ	16.91704604	99.38055472	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1166	NT1_แม่สอด2	16.71127000	98.55633410	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1167	NT1_แม่กุ	16.62997000	98.60042000	NT1	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1168	NT1_แม่โกนเกน	16.58856000	98.58808000	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1169	NT1_แม่ตาวกลาง	16.67784000	98.57080300	NT1	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1170	NT1_ท่าอาจ	16.70256900	98.51833160	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1171	NT1_แม่ปะ	16.75888896	98.58519586	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1172	NT1_แม่กึ๊ดหลวง	16.80124000	98.59818600	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1173	NT1_แม่กาษา	16.87724000	98.62538200	NT1	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1174	แม่สลิด 24k 	17.16213754	99.12824223	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1175	tak-payt-24k01	17.14806735	99.07119701	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1176	tak-wmn1-24k01	17.20230733	99.12469099	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1177	tak-mkm-24k01	16.79755483	98.59478993	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1178	tak-mks-24k01	16.86876097	98.62251977	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1179	แม่จะเรา ม.8 24k 	16.88101561	98.57823633	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1180	tak-ykb-24k01	17.35231068	99.05529956	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1181	แม่ละเมา  24k	16.80104464	98.76637784	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1182	tak-wach3-24k01	16.66018127	99.23648010	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1183	พบพระ  24k	16.38664027	98.68896060	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1184	แม่สอด  24k	16.71195636	98.57349972	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1185	tak-nmr2-24k01	16.88575755	99.18943951	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1186	tak-pdm3-24k01	16.74359847	99.21189497	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1187	tak-mto3-24k01	16.80569449	99.05290435	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1188	tak-whm3-24k01	16.80781536	99.15862093	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1189	tak-pdm2-24k01	17.06161352	99.27080701	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1190	tak-tkt5-24k01	17.02645552	99.07029579	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1191	tak-thf2-24k01	17.06030579	98.97510956	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1192	tak-hmbn-24k01	17.11075182	99.08344934	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1193	tak-k101-24k01	16.75746782	98.91557524	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1194	tak-ckp7-24k01	16.51259269	98.70279292	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1195	tak-ckp1-24k01	16.47468635	98.64996950	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1196	tak-hny-24k01	16.42176062	98.79149432	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1197	tak-hmb-24k01	16.59100546	98.62365038	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1201	tak-bscr-24k01	16.38422048	98.74111624	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1202	tak-bkc-24k01	16.61574081	98.65420957	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1203	tak-hkl-24k01	16.76032353	98.53758395	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1204	BigRock_เอื้องดอย	16.70176836	98.61896109	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1205	BigRock_สามเงา	17.24979462	99.02316670	DE	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1206	BigRock_พะเด๊ะ	16.66194697	98.61579475	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1207	BigRock_ขะเนจื้อ	17.02353985	98.51114717	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1208	BigRock_แม่กุหลวง	16.62303561	98.57804831	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1209	BigRock_วังโพ	17.25762866	99.08523878	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1210	BigRock_แม่สลิดหลวง	17.43105501	98.06435777	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1211	BigRock_ห้วยยะอุ	16.74408391	98.81251136	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1212	BigRock_นุเซะโปล้	16.00407939	98.66687040	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1213	BigRock_อุ้มเปี้ยม	16.41217232	99.00474484	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2973	lpg_fttx_pst_02	18.29500347	99.41611096	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1214	BigRock_แม่กลองคี	16.22883475	98.92150823	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1215	BigRock_ปรอผาโด้	16.10553807	98.88491927	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1216	BigRock_บ้านถ้ำผาโด้	16.62482257	98.75772425	DE	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1217	tak-tak-USO634	16.94116253	99.43020684	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1218	USO_641	16.96393759	98.63373584	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1219	tak-mrt-USO645	17.01345989	98.51960085	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1220	USO_648	16.97139621	98.58646764	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1221	USO_651	17.02048617	98.54710935	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1222	USO_652	17.01561650	99.19209234	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1223	tak-tak-USO653	16.99577581	99.39030257	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1224	tak-tak-USO654	17.03252546	99.27702724	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1225	USO_656	17.04283666	98.49235202	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1226	tak-tak-USO660	17.07825400	99.25924000	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1227	USO_587	16.47980902	98.83766798	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1228	USO_664	17.12790629	99.25305028	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1229	USO_666	17.14866600	98.36182998	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1230	USO_675	17.18897392	98.32805609	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1231	USO_680	17.23988566	99.25010873	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1232	USO_628	16.91584628	99.33205299	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1233	tak-tak-USO638	16.95437556	99.26707717	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1234	TOT_018	16.92154721	99.39190831	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1236	TOT_คีรีราษฎร์ ม.5	16.47548042	98.83591771	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1237	TOT_แม่หละไทย	17.13212448	98.30752014	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1238	USO_590	16.48276496	98.80240972	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1239	TOT_022	17.34160611	98.11013823	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1240	USO_594	16.48775765	98.78660248	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1241	USO_601	16.55081778	99.20943120	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1242	tak-tak-USO622	16.84049258	99.37461136	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1243	USO_631	16.85724215	99.22118826	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1244	tak-tak-USO632	16.91869160	99.38156444	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1245	NT_ตาก XGSPON	16.88224994	99.12552123	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1246	NT_ริมเมย	16.70081581	98.52734277	NT2	ตาก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1247	NT_แม่ระมาด-XGSPON	16.98565637	98.51565771	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1248	NT_บ้านตาก	17.04136182	99.08429942	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1249	NT_แม่กุ	16.63821864	98.60250495	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1250	NT_แม่จะเรา	16.96628550	98.56628709	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1251	NT_วังเจ้า	16.68041335	99.27576373	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1252	NT_ท่าสองยาง	17.22730014	98.22524975	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1253	NT_ท้องฟ้า ม.9	17.04686130	98.98504446	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1254	NT_ตาก CAB#017	16.85437708	99.12848566	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1255	NT_ตาก CAB#023	16.88220025	99.11339889	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1256	NT_ไม้งาม ม.4 (ป่าไม้เก่า)	16.90472753	99.09855482	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1257	NT_แม่ท้อ ม.9	16.79394454	99.03130720	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1258	NT_ย่านรี ม.1	17.14920389	99.06501284	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1259	NT_วังประจบ ม.1	16.91605088	99.33231006	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1260	NT_แม่สอด CAB#017	16.74284408	98.57632214	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1261	NT_วัดดอนแก้ว	16.71530848	98.55684093	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1262	NT_สี่แยกทางหลวงตาก	16.88637353	99.12778089	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1263	NT_สินมั่นคง	16.87827842	99.14814422	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1264	NT_ตาก CAB#011	16.85525656	99.12229578	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1265	NT_ตาก CAB#019	16.86932567	99.13501213	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1266	NT_แยกเจ้้าสัว	16.71802851	98.58479786	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1267	NT_แม่สอด CAB#004	16.71604131	98.56936182	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1268	NT_ซอยอิสลาม	16.70961957	98.56903398	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1269	NT_อนามัยตากตก	17.03971940	99.06425143	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1270	NT_บ้านวังไคร้ ม.2	17.21727011	99.07661507	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1271	NT_ค้างภิบาล	16.70961556	98.60033656	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1272	NT_บ้านนา ม.4	17.21492329	99.05054400	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1273	NT_สมอโคน	17.00992051	99.09124384	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1274	NT_แม่กลอง ม.4	16.04686456	98.84854921	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1275	NT_บ้านท่าไม้แดง	16.79859479	99.17413751	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1276	NT_บ้านท่าตะคร้อ	16.78438818	99.18005446	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1277	NT_สามแยกพระธาตุ ม.3	17.06294176	99.04919217	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1278	NT_แยกแม่ระมาดน้อย	17.00356857	98.52555015	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1279	NT_แม่จะเราสองแคว	16.96369256	98.57804239	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1280	NT_แม่โกนเกน	16.59577847	98.58677934	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1281	NT_แม่ปะ ม.7	16.74421291	98.61090423	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1282	NT_บ้านแม่อุสุ	17.30196121	98.17804354	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1283	NT_ปรอผาโด้	16.10478435	98.88731444	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1284	NT_โมโกร	16.19829673	98.87986968	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1285	NT_โรงเลื่อยบ้านตาก	17.04441488	99.07354797	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1286	NT_อบต.หนองบัวเหนือ	16.92389033	99.07507280	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1287	NT_ตลาดวังเจ้า	16.67780705	99.26522718	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1288	NT_เขา1010	16.77927556	98.92544210	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1289	NT_หนองหลวง(แยกเคลอคี)	16.06949000	98.78070300	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1290	NT_สันป่าไร่	16.96201000	98.61607900	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1291	NT_บ้านแม่ตะวอ	17.56880000	97.91835800	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1292	NT_แม่ปะบ้านสัน	16.74894058	98.58035338	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1293	NT_ทุ่งกระเชาะ	17.01982225	99.00707855	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1294	NT_บ้านธาตุ (บ้านจ่อคี)	17.19294065	98.42774885	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1295	NT_บ้านสันป่าตึง	16.98354065	98.52975274	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1296	NT_เขื่อนภูมิพล	17.24425028	99.00278870	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1297	NT_บ้านหนองหลวง	17.06213700	98.63749460	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1298	NT_ท่าไผ่	17.31583000	99.06512800	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1299	NT_บ้านสามหมื่น	17.06853566	98.73799335	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1300	NT2_ห้วยยะอุ	16.74368100	98.80897540	NT2	ตาก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1301	NT_บ้านวังผา	16.83262088	98.53967450	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1302	NT_แม่ตาว ม.5	16.67787996	98.56689344	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1303	NT_เจดีย์โค๊ะ	16.55199856	98.70168185	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1304	NT_แม่ตาว ม.3	16.67176073	98.58067546	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1305	NT_ตาก CAB#002	16.87931743	99.12198952	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1306	NT_ตาก CAB#018	16.86665144	99.12705438	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1307	NT_ตาก CAB#006	16.87124496	99.13327663	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1308	NT_ตาก CAB#008	16.88559273	99.12689138	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1309	NT_น้ำรึม ม.8	16.86038276	99.14054284	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1310	NT_ไม้งาม ม.7	16.91131843	99.11944848	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1311	NT_ตาก CAB#024	16.88429637	99.12985894	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1312	NT_ตาก CAB#026	16.88630277	99.12207445	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1313	NT_ริมเมย CAB#004	16.70211835	98.50916325	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1314	NT_แม่สอด CAB#005	16.70629385	98.56544346	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1315	NT_แม่สอด CAB#006	16.70936661	98.55917072	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1316	NT_แม่สอด CAB#008	16.71296822	98.55750546	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1317	NT_แม่สอด CAB#016	16.72075986	98.56247818	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1318	NT_แม่สอด CAB#019	16.71847934	98.58807298	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1319	NT_แม่สอด CAB#022	16.71166020	98.59348337	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1320	NT_แม่สอด CAB#025	16.73176950	98.57274803	NT2	ตาก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1321	NT1_ทะนง	16.07540000	100.21043000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1322	NT1_ท่าเสา	15.99392000	100.22150000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1323	NT1_โพทะเล	16.09255000	100.27052100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1324	NT1_วังตะกู	16.02222000	100.46588900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1325	สากเหล็ก	16.49392300	100.47596100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1326	หนองตะเคียน	16.56983900	100.57267600	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1327	ท่าเยี่ยม	16.52433000	100.55814000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1328	NT1_บางลาย	16.15508000	100.29065800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1329	NT1_ทับปรู ZTE	16.18717000	100.29081000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1330	NT1_CDMA เขาทราย	16.15154000	100.61857400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1331	NT1_เขาทราย	16.15324000	100.62145700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1332	NT1_ทับคล้อ	16.16964000	100.57300400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1333	NT1_วังทับไทร ZTE	16.46205000	100.55542500	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1334	วังทรายพูน	16.40523800	100.53020300	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1335	บ้านเขาดิน	16.32571000	100.56899200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1336	เนินหัวโล้-หนองยาง	16.40373610	100.59229200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1337	หนองปล้อง	16.32590000	100.50240000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1338	สายคำโห้	16.42060900	100.45617400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1339	สี่แยก อบต.เขาเจ็ดลูก	16.27669000	100.60030700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1340	NT1_ดงเจริญ	16.04003000	100.62682000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1341	NT1_สำนักขุนเณร	16.02023000	100.53904500	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1342	NT1_ตลิ่งชัน	16.01316000	100.73975900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1343	NT1_วังบงค์ ZTE	16.03688000	100.57419800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1344	สามง่าม	16.50665600	100.20326600	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1345	กำแพงดิน	16.58221400	100.22169400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1346	บ้านนา	16.50791300	100.17033000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1347	ปลวกสูง	16.49958800	100.14503900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1348	บึงบัว(วชิร)	16.50288200	100.04689800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1349	วชิรบารมี (การนิคม)	16.58138600	100.14826000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1350	หนองหลุม	16.56943100	100.13461000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1351	หนองหญ้าปล้อง	16.55648990	100.04764500	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1352	ห้วยห้าง	16.56227000	100.17437200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1353	NT1_บึงนาราง	16.18954000	100.12951800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1354	NT1_แหลมรัง	16.24072000	100.08199700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1355	NT1_บ้านใหม่สามัคคี	16.20367000	100.08213100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1356	NT1_ทุ่งโคราช	16.22800000	100.05594100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1357	NT1_โป่งวัวแดง	16.21002000	100.03435700	NT1	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1358	NT1_ดงไทร ZTE	16.23437000	100.12574400	NT1	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1359	หัวดง	16.35054200	100.39796000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1360	NT1_บางไผ่	16.12627000	100.40429000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1361	NT1_บางมูลนาก	16.02855000	100.37039600	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1362	NT1_ท่าบัว	16.06314000	100.31693000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1363	NT1_วังสำโรง(บางมูลนาก)	15.98470000	100.41926000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1364	NT1_โพธิ์ไทรงาม	16.09527000	100.12633000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1365	NT1_ร.ร.ศรีศรัทธามิตรภาพ	16.12272000	100.14071600	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1366	NT1_บ้านพลัง	16.03662000	100.13006500	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1367	NT1_น้ำโจน	16.28164000	100.41880200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1368	NT1_ป่าแดง	16.25566000	100.44771200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1369	NT1_ตะพานหิน	16.21701000	100.42705200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1370	NT1_ดงตะขบ	16.14044000	100.48190400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1371	NT1_สี่แยกศิริวัฒน์	16.22256000	100.41067900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1372	NT1_วังหว้า	16.22178000	100.37225100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1373	NT1_วังสำโรง_	16.24504600	100.30680700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1374	NT1_ท่าปอ ZTE	16.26273000	100.37783100	NT1	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1375	NT1_คลองทองหลาง ZTE	16.22470000	100.38890500	NT1	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1376	ป่ามะคาบ	16.51616100	100.38249900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1377	ยานยาว(วังกระดี่ทอง)	16.49499700	100.26872700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1378	ดงกลาง	16.33104100	100.35343700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1379	วังกรด	16.40169300	100.38921100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1380	NT1_สค.พิจิตร ZTE	16.44905000	100.33747200	NT1	พิจิตร	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1381	รังนก	16.43303300	100.20720100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1382	ปากทาง	16.46472400	100.33025400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1383	วัดดาน	16.51463200	100.31046000	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1384	เมืองเก่า(วัดเขื่อน)	16.40422100	100.30116100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1385	โรงช้าง_พิจิตร	16.42637900	100.28786300	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1386	ท่าฬ่อ	16.51279931	100.33217456	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1387	สวนสมเด็จ	16.43373300	100.35139800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1388	ชัยอรุณ	16.43702000	100.34146300	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1389	สค.พิจิตร3	16.44314370	100.33114700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1390	หนองโสน	16.42058900	100.14497800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1391	หนองโสน(pijit)	16.39584600	100.06182800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1392	เนินปอ	16.41501500	100.16230100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1393	หน้าวัดตอรัง	16.38219200	99.97889200	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1394	หน้าวัดหนองขาว	16.44641900	100.02028800	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1395	หนองสะเดา	16.46580500	100.13258900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1396	หนองหัวปลวก	16.35612900	100.13137100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1397	ดงเสือเหลือง	16.26837100	100.13090900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1398	รพสต.ดงเสือเหลือง	16.26985400	100.18283100	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1399	ทุ่งใหญ่	16.27898000	100.10188700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1400	วัดหนองพง	16.29218800	100.05272300	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1401	โพธิ์ประทับช้าง	16.31293800	100.27445900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1402	ไผ่ท่าโพ	16.28137000	100.24723700	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1403	วัดโพธิ์ประทับช้าง	16.30332900	100.31354900	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1404	ไผ่รอบ	16.36278700	100.22067400	NT1	พิจิตร	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1405	pct-skn-24k01สำนักขุนเณร	16.01909293	100.54023780	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1406	pct-wab-24k01 วังบงค์	16.02837991	100.57395340	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1407	pct-lpd1-24k01 ลำประดา1	16.06744902	100.53402090	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1408	pct-kdn-24k01 เขาดิน	16.09812986	100.54003080	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1409	pct-dep-24k01 ไดอีเผือก	16.12229898	100.54511920	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1410	pct-hup-24k01 ห้วยพุก	15.97775228	100.57758610	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1411	pct-hrm3-24k01 ห้วยร่วม ม.3	15.95294282	100.55740640	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1412	pct-cry-24k01 ชะลอมยาว	15.96383126	100.48477750	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1413	pct-dep1-24k01 ไดอีเผือก1	16.07691120	100.60213720	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1414	pct-wnm2-24k01 วังงิ้ว ม.2	16.01334212	100.73951230	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1415	pct-tar-24k01 ท่าเรือ	16.01702887	100.62953120	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1416	pct-wat2-24k01 วังงิ้วใต้ ม.2	16.03451741	100.63048350	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1417	pct-nmk1-24k01 เนินมะกอก1	16.00717561	100.35979990	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1418	pct-tbu-24k01 ท่าบัว	16.06297788	100.31675320	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1419	pct-wal-24k01 วัดหลวง	16.07449196	100.34293420	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1525	pct-sym-USO583	16.38260575	99.97931060	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1420	pct-wtt-24k01 วัดทับทิม	16.09241535	100.34686400	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1421	pct-bkn-24k01 บางคลาน	16.01508846	100.27363800	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1422	pct-wda-24k01 วังแดง	15.97579719	100.27234840	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1423	pct-ptl-24k01 โพทะเลFTTX	16.09732513	100.26149700	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1424	pct-tan-24k01 ทะนง	16.07979787	100.21644400	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1425	pct-tkm-24k01 ท่าขมิ้น	16.03116618	100.17018960	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1426	pct-ypn-24k01 ยางพะเนียด	16.00685258	100.14783090	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1427	pct-pan-24k01 พังน้อย	15.95650574	100.21226910	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1428	pct-tin-24k01 ท้ายน้ำ	16.13987771	100.23118070	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1429	pct-nbu-24k01 หนองบัว	16.11760526	100.19401070	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1430	pct-psn9-24k01	16.12216887	100.14237750	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1431	pct-hkm2-24k01 ห้วยแก้ว	16.15635204	100.12353680	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1432	pct-lar-24k01 แหลมรัง	16.20339699	100.08258300	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1433	pct-nsr-24k01 เนินสำราญ	16.20892632	100.05470050	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1434	pct-ncs-24k01 เนินชัยศรี	15.99987287	100.56771370	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1435	 กำแพงดิน	16.58458803	100.22029760	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1436	วังโมกข์	16.55756510	100.08551870	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1437	ราชช้างขวัญ	16.46726236	100.33447610	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1438	แหลมทอง	16.24039885	100.08513816	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1439	มาบฝาง	16.46466366	100.03858274	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1440	pct-bba1-bigrock-01	16.50347600	100.05422632	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1441	บัวยาง	16.56977928	100.14780034	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1442	pct-slk-24k01 สากเหล็ก FTTx	16.48585370	100.48051010	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1443	pct-bbg-24k01 บ้านบุ่ง	16.40846581	100.40662360	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1444	pct-tym2-24k01 ท่าเยี่ยม ม.2	16.52551500	100.55337990	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1445	pct-nsh-24k01 หนองสองห้อง	16.51258888	100.57539080	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1446	pct-nog-24k01 หนองจั่ว	16.54981417	100.54712030	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1447	pct-ksa-24k01 คลองทราย	16.54475036	100.50937880	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1448	pct-npl-24k01 หนองปลาไหล	16.44059028	100.50784970	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1449	pct-was1-24k01 วังทับไทร1	16.46497654	100.55912620	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1450	pct-wsp-24k01 วังทรายพูน	16.40802395	100.52838220	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1451	pct-nhl-24k01 เนินหัวโล้	16.40768104	100.59669950	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1452	pct-pkn-24k01 ป่าเขาน้อย	16.35170002	100.60637660	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1453	pct-npa-24k01 หนองพระ	16.33663748	100.56571290	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1454	pct-hdg-24k01 หัวดง	16.35300598	100.39578720	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1455	pct-nyw1-24k01 เนินยาว	16.33548174	100.45059320	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1456	pct-npg-24k01 เนินยาว	16.32663729	100.49826320	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1457	pct-kpg-24k01 เขาพนมกาว	16.30322050	100.47994520	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1458	pct-kkw-24k01 โคกขวาง	16.34731867	100.49332520	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1459	pct-kma-24k01 ฆะมัง	16.36986466	100.36518140	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1460	pct-dpk-24k01 ดงป่าคำ	16.31918969	100.38949710	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1461	pct-tkl-24k01 ท่าคล้อ	16.50883304	100.52240510	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1462	pct-skh1-24k01 สายคำโห้ ม.1	16.42082407	100.45675380	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1463	pct-pmk-24k01 ป่ามะคาบ	16.46274094	100.39368210	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1464	pct-pmk1-24k01 ป่ามะคาบ1	16.51184605	100.38173320	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1465	pct-tkt-24k01 ท่ากระทู้	16.40155045	100.34211430	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1466	pct-wkdt-24k01 วังกระดี่ทอง	16.49609900	100.26899100	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1467	pct-whd-24k01 วัดหาด	16.50675748	100.28199860	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1468	pct-knn1-24k01 คลองโนน1	16.47724800	100.25177400	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1469	pct-knn-24k01 คลองโนน	16.47232500	100.24820000	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1470	pct-rn11-24k01 รังนก ม.11	16.43678300	100.21210300	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1471	pct-sym-24k01 สามง่ามFTTx	16.50882235	100.19915180	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1472	pct-jkp-24k01 จระเข้ผอม	16.47707851	100.22456840	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1473	pct-nts-24k01 หนองต้นไทร	16.30264269	100.31202230	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1474	pct-bpo-24k01 บึงโพธิ์	16.34121620	100.28697260	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1475	pct-tkg-24k01 ท่าข่อย	16.36445296	100.27905770	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1476	pct-wag-24k01 วังจิก	16.35663253	100.26176290	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1477	pct-prp-24k01 ไผ่รอบ	16.36279625	100.21398890	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1478	pct-nlg-24k01 หนองหลวง	16.36653821	100.19937200	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1479	pct-spt-24k01 สระปทุม	16.33248604	100.20835860	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1480	pct-ptp-24k01 ไผ่ท่าโพ	16.27805370	100.25360640	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1481	pct-dsl2-24k01 ดงเสือเหลือง ม.2	16.26839529	100.18247920	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1482	pct-nsd-24k01 หนองสะเดา	16.46409974	100.13945580	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1483	pct-npg-24k02 เนินพลวง	16.40315914	100.11293890	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1484	pct-nhp-24k01 หนองหัวปลวก	16.35703585	100.09533760	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1485	pct-nbu1-24k01 หนองบัว1	16.33925372	100.12844680	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1486	pct-nkl-24k01 หนองคล้า	16.30956756	100.13619890	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1487	pct-wcr-24k01 วชิรบารมี	16.56251236	100.15113520	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1488	pct-nsw1-24k01 เนินสว่าง1	16.30617979	100.20243060	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1489	pct-ppd-24k01 ปมประดู่	16.26147013	100.16242280	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1490	pct-tym1-24k01 ทุ่งใหญ่ ม.1	16.27804287	100.10458240	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1491	pct-tpp-24k01 ทุ่งประพาส	16.28369849	100.07975190	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1492	pct-npk-24k01 หนองพง	16.29288818	100.05170090	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1493	pct-thn1-24k01 ตะพานหิน1	16.21003421	100.45617160	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1494	pct-npgk-24k01 หนองพงศ์	16.23799007	100.46233480	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1495	pct-dtk-24k01 ดงตะชบ	16.14085538	100.48252820	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1496	pct-wlm-24k01 วังหลุม	16.18719243	100.52208450	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1497	pct-klg-24k01 เขารวก	16.22664362	100.53155610	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1498	pct-ksl-24k01 เขาทรายFTTx	16.14496125	100.62065820	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1499	pct-wdg2-24k01 วังแดง2	16.22395817	100.62949120	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1500	pct-jst-24k01 จิตเสือเต้น	16.25211038	100.61357230	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1501	pct-kcl7-24k01 เขาเจ็ดลูกม.7	16.28021590	100.59825910	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1502	pct-nplu-24k01 เนินพวง	16.28071915	100.55558790	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1503	pct-nrm5-24k01 งิ้วรายม.5	16.26750696	100.41527270	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1504	pct-pol-24k01 โพธิ์ลอย	16.25355754	100.40502350	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1505	pct-wwm6-24k01 วังหว้าม.6	16.22245010	100.37235270	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1506	pct-ktl-24k01 คลองทองหลาง	16.22472442	100.38851130	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1507	pct-ww1-24k01 วังหว้า1	16.22662034	100.35516520	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1508	pct-wsr-24k01 วังสำโรงFTTx	16.23155140	100.30350580	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1509	pct-bnr1-24k01 บึงนารางม.1	16.18991697	100.19868380	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1510	pct-prk-24k01 ไผ่ร้อยกอ	16.16981118	100.40362430	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1511	pct-kko-24k01 คลองข่อย	16.16701462	100.39338550	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1512	pct-knm2-24k01 คลองคูณ	16.14358850	100.36045500	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1513	pct-yts-24k01 ย่านท่าเสา	16.10157290	100.39747900	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1514	pct-hka-24k01 หอไกร	16.08453954	100.40142550	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1515	pct-dpd-24k01 ไดปลาดุก	15.98451417	100.41872100	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1516	pct-dis-24k01 ไดโสน	16.06153421	100.45596180	DE	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1517	pct-wtk-24k01 วังตะกู	16.02126972	100.47512690	DE	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1518	pct-wtk-USO557	16.05167300	100.49810650	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1519	pct-thn-USO560	16.11507877	100.47876830	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1520	pct-ksl-USO563	16.23569158	100.69390490	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1521	pct-ppc-USO571	16.31548378	100.01578940	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1522	pct-sym-USO579	16.40085196	100.01391560	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1523	pct-sym-USO580	16.35708932	100.06451490	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1524	pct-sym-USO582	16.37458779	100.13254860	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1526	nrenpoa	16.41686764	100.16174370	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1527	ย่านยาว Huawei	16.49839923	100.28412415	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1528	pct_ppc_02	16.31154184	100.27372250	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1529	วัดโรงช้าง	16.42610510	100.28770800	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1530	-BABUNAG.	16.02715419	100.37896149	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1531	-ทับคล้อ	16.17296135	100.56538843	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1532	มาบแฟบ	16.43166860	100.14243740	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1533	PakTang	16.45216089	100.33423320	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1534	Phichit-R	16.44851019	100.32024970	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1535	บางลาย	16.19126922	100.23877220	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1536	pct_dtk_01	16.14309932	100.50881630	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1537	4แยก ตพ.	16.22211228	100.40991060	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1538	POP	16.45701599	100.34381660	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1539	Node ท่าบัว	16.05470912	100.29300227	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1540	Wamg-Learn	16.03222347	100.66187310	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1541	ThaLuang	16.41304375	100.37015600	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1542	ท่าช้าง	16.00102298	100.36030041	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1543	4แยก บน.	16.03454827	100.37131890	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1544	ทับปรู	16.19041082	100.29022676	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1545	node วังกรด	16.40647244	100.38388355	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1546	Node บางไผ่	16.13079253	100.40435301	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1547	 C600 พิจิตร	16.43704642	100.34523539	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1548	- TPH	16.21638849	100.42721131	NT2	พิจิตร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1549	pct_psn9_01	16.12561605	100.12589120	NT2	พิจิตร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1550	NAN_GPON FH Na Noi NT1	18.33700153	100.71138452	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1551	NAN_GPON-FH Na Muen NT1	18.19862242	100.66070615	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1552	NAN_GPON FH MaeJarim NT1	18.70094166	101.00582152	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1553	NAN_GPON FH Chiang Klang NT1	19.31026626	100.86002330	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1554	NAN_GPON-FH Thungchang NT1	19.38913783	100.87699520	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1555	NAN_GPON-FH Huai Koan NT1	19.59658337	101.08349840	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1556	NAN_GPON-FH Borkluer NT1	19.14371290	101.15414592	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1557	NAN_GPON-FH Pua NT1	19.17598914	100.91229589	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1558	NAN_GPON FH Silapetch NT1	19.07425284	100.92709707	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1559	NAN_GPON FH SantiSuk NT1	18.96280509	100.92484297	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1560	NAN_GPON-FH WiangSa NT1	18.57093455	100.74366372	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1561	NAN_GPON FH NamPua NT1	18.64198351	100.74286753	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1562	NAN_GPON-FH Nammuab NT1	18.48694731	100.93939962	NT1	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1563	NAN_GPON FH Nalueng NT1	18.67250609	100.78669597	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1564	NAN_GPON-FH MuangChang NT1	18.86421461	100.82485133	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1565	NAN_GPON-FH Office NT1	18.79377160	100.78107953	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1566	NAN_GPON-FH SuanTan NT1	18.78277442	100.77453446	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1567	NAN_GPON FH Ban Huai Li NT1	18.81406677	100.66427104	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1568	NAN_GPON FH Bo Suak NT1	18.71761330	100.65137154	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1569	NAN_GPON FH Pupaing NT1	18.74397415	100.80548389	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1570	NAN_GPON-FH Dutai NT1	18.73507311	100.75521113	NT1	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1571	NAN_GPON-FH BanLoung NT1	18.84907702	100.44123794	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1572	NAN_GPON FH_SongKwae NT1	19.36091682	100.70489254	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1573	NAN_GPON-FH Thawangpa NT1	19.11180680	100.80906506	NT1	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1574	nan-bks-24k01 (บ้านกาใส)	18.86359008	100.67777181	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1575	nan-bsm-24k01 (บ้านสะไมย์)	18.70616026	100.67440737	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1576	nan-spw-24k01 (บ้านสระภูเวียง)	18.93213675	100.76055387	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1577	nan-bht-24k01 (บ้านห้วยตึม)	18.85032453	100.43998446	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1578	nan-btt-24k01 (บ้านทุ่งทอง)	18.65777620	100.70414164	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1579	nan-bnd-24k01 (บ้านนาดอย)	18.26621681	100.70978111	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1580	nan-bdm-24k01 (บ้านดอนมูล)	18.16688842	100.63583851	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1581	nan-bbr-24k01 (บ้านบวกแรด)	18.66098192	100.96427011	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1582	nan-bnw-24k01 (บ้านน้ำว้า)	18.64494724	101.00999197	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1583	nan-hss-24k01 (บ้านห้วยสันทราย)	18.58216170	100.71599370	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1584	nan-bdt-24k01 (บ้านดอนแท่น)	19.25959907	100.84874527	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1585	nan-dsp-24k01 (บ้านดอนสบเปือ)	19.31842013	100.84906805	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1586	nan-bhn-24k01 (บ้านหัวน้ำ)	19.33227265	100.90619070	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1587	nan-pcr-24k01 (บ้านพืชเจริญ)	18.37073292	100.67394014	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1588	nan-bnh-24k01 (บ้านนาแหน)	18.32377367	100.61819653	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1589	nan-bnm-24k01 (บ้านนาม่วง)	18.17146700	100.50220800	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1590	nan-bmn-24k01 (บ้านม่วงเนิ้ง)	18.52878000	100.75512000	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1591	nan-lmp-24k01 (บ้านหลับมึนพรวน)	18.62293739	100.83184922	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1592	nan-bdm-24k01 (บ้านดอนมูลปัว)	19.17842911	100.84903987	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1593	nan-bkh-24k01 (บ้านค้างฮ้อ)	19.15202276	100.93419089	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1594	nan-bnh-24k01 (บ้านน้ำฮาว)	19.09393109	100.84302850	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1595	nan-dps-24k01 (บ้านดงป่าสัก)	18.73250792	100.83690606	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1596	nan-bws-24k01 (บ้านเวียงสอง)	19.42242220	100.88038100	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1597	nan-ฺbss-24k01 (บ้านสบสาย)	19.02431051	100.79562087	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1598	nan-han3-24k01 (บ้านแหน3)	19.17741278	100.77319260	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1599	nan-bhk-24k01 (บ้านห้วยคำ)	18.78850500	100.91274500	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1600	nan-bph-24k01 (บ้านปางไฮ)	19.35418292	100.70737996	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1601	nan-twk-24k01 (ถ้ำเวียงแก)	19.33025956	100.71419734	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1602	nan-mnf-24k01 (บ้านใหม่ในฝัน)	18.85783394	100.57889384	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1603	nan-bfm-24k01 (บ้านฝั่งหมิ่น)	18.52389672	100.56641914	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1604	nan-bnk-24k01 (บ้านน้ำไคร้)	19.13114386	100.73830006	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1605	nan-bph-24k02 (บ้านผักเฮือก)	19.08133746	101.15345206	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1606	nan-bht-24k01 (บ้านห้วยท่าง)	19.21925381	100.91935544	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1607	nan-bhl-24k01 (บ้านห้วยล้า)	19.20099163	100.93195256	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1608	nan-bts-24k01 (บ้านทุ่งสุน)	19.46945493	100.89615282	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1609	nan-bdu-24k01 (บ้านดู่)	19.28454170	100.90024596	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1610	nan-bkc-24k01 (บ้านกิ่วจันทร์)	19.54450785	101.14627244	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2974	lpg_mmo_xgs_01	18.27435298	99.65321672	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1611	nan-mcr-24k01 (บ้านใหม่ไชยธงรัตน์)	19.58304557	101.02425901	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1612	nan-kst-bigrock-01 (ขุนสถาน)	18.29719798	100.48747747	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1613	nan-yhn-bigrock-01 (ยาบหัวนา)	18.58264111	100.51031683	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1614	nan-btk-bigrock-01 (บ้านเต๋ยกลาง)	19.21951469	101.06365834	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1615	nan-bkk-24k01 (บ้านก่อก๋วง)	19.15236604	101.15548347	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1616	แม่ขะนิง	18.76080132	100.54078170	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1617	nan-bnt-bigrock-01 (บ้านน้ำตวง)	18.74848900	101.19667700	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1618	nan-dtw-bigrock-01 (ดอยติ้ว)	19.10074500	100.67043700	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1619	nan-byk-bigrock-01 (บ้านบ่อหยวก)	19.28181822	101.17562657	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1620	nan-bkm-24k01 (บ้านกิ่วม่วง)	18.91703653	100.87746674	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1621	nan-snm-24k01 (บ้านศรีนาม่าน)	18.90130697	100.95058137	DE	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1622	NAN-NNI-TOT015 (USO บ้านใหม่หัวดง)	18.31619212	100.60554621	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1623	nan_mskn_zte01 บ้านแม่สาคร	18.52015000	100.65012800	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1624	nan_ttg_zte01 ถึมตอง	18.80288300	100.70410000	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1625	nan_sow_zte01 สองแคว	19.34558677	100.71071535	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1626	nan_yom_zte01 ยม	19.08219169	100.88631745	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1627	nan_bnk_zte01 น้ำเกี๋ยน	18.73168300	100.83543300	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1628	nan_bnmb_zte01 น้ำมวบ	18.48670600	100.93952600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1629	nan_bcp_zte01 แช่พลาง	18.74675092	100.77543450	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1630	nan_bmj_zte01 เมืองจัง	18.85851900	100.81667600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1631	nan_slp_zte01 ศิลาเพชร	19.11558800	100.94797800	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1632	nan_npu_zte01 น้ำปั้ว	18.63474667	100.74342207	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1633	nan_pasi_zte01 ผาสิงห์	18.88323000	100.74867700	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1634	nan_nto_zte01 หนองเต่า	18.75671173	100.79112505	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1635	nan_suak_zte01 สวก	18.73206942	100.68408426	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1636	nan_ngob_zte01 งอบ	19.48322500	100.89699800	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1637	nan_jdc_zte01 เจดีย์ชัย	19.17113600	100.83679700	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1638	nan_bhl_zte01 บ้านไฮหลวง	19.27296000	100.83851600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1639	nan_btk_zte01 บ้านท่าค้ำ	19.09548300	100.79950000	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1640	nan_cst_zte01 ไชยสถาน	18.77329400	100.70549200	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1641	nan_nkm_zte01 น้ำครกใหม่	18.67853200	100.75490700	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1642	nan_str_zte01 บ้านสถารศ	18.79531000	100.78310800	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1643	nan_ncs_zte01 รร.นคศ.	18.78737455	100.78367411	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1644	nan_bck_zte01 บ้านเชียงแข็ง	18.80299033	100.79039737	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1645	nan_btn_zte01 บ้านทุ่งน้อย	18.77326200	100.81961600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1646	nan_bsd_zte01 บ้านแสงดาว	18.77366000	100.78063300	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1647	nan_bpk_zte01 บ้านปางค่า	18.77846000	100.75959300	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1648	nan_btst_zte01 บ้านทุ่งเศรษฐี	18.80358130	100.77758125	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1649	nan_bmkt_zte01 บ้านมงคลนิมิตร	18.79228854	100.77199864	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1650	nan_wrnk_zte01 รร.วรนคร	19.17594000	100.91614500	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1651	nan_btl_zte01 บ้านต้นแหลง	19.18849000	100.90972100	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1652	nan_bhd_zte01 บ้านห้วยเดื่อ	19.06146056	100.80685900	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1653	nan_anl_zte01 อ่ายนาไลย	18.55415686	100.71606342	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1654	nan_bbn_zte01 บ้านบุญนาค	18.54958500	100.75528600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1655	nan_bst_zte01 สถาน นาน้อย	18.24011000	100.68792700	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1656	nan_ouan_zte01 อวน	18.98609900	100.93921800	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1657	nan_bkng_zte01 บ้านค่างาม	18.78639073	100.74135346	NT2	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1658	nan_ngc_zte02 ศ.ราชการใหม่	18.79830000	100.73169000	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1659	nan_twp_zte02 ท่าวังผา	19.12419631	100.81435504	NT2	น่าน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1660	nan_pua_zte02 ปัว02	19.18141038	100.90575810	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1661	nan_saa_zte02 เวียงสา	18.56785364	100.74787370	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1662	nan_nni_zte02 นาน้อย	18.32589251	100.71162096	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1663	nan_bapi_zte01 บ้านอภัย	18.77272400	100.76576400	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1664	nan_ckg_zte02 เชียงกลาง	19.29327984	100.86190925	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1665	nan_thg_zte02 ทุ่งช้าง	19.38606689	100.87505887	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1666	nan_sts_zte02 สันติสุข	18.92461056	100.91829608	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1667	nan_nmu_zte02 นาหมื่น	18.18964387	100.65833951	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1668	nan_mjr_zte02 แม่จริม	18.70217445	101.00510265	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1669	nan_tcm_zte01 ตาลชุม	18.64686980	100.76936110	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1670	nan_nan_zte01 น่าน	18.77991496	100.77216130	NT2	น่าน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1671	nan_dti_zte01 ส่วนบริการลูกค้าดู่ใต้	18.73546428	100.75582000	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1672	nan_bnn_zte01 บ้านนาหนุน	19.13334623	100.79727110	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1673	nan_brng_zte01 บ้านร้องแง	19.17442300	100.94195600	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1674	nan_blg_hw01 บ้านหลวง	18.85045290	100.43964360	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1675	nan_cpk_hw01 ห้วยโก๋น ม.1	19.57874600	101.08176400	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1676	nan_bok_hw01 บ่อเกลือ	19.14703294	101.15672125	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1677	nan_npg_hw01 สามแยกนาปัง	18.71275400	100.77588400	NT2	น่าน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1678	NT1 _PYO FH ภูกามยาว	19.25687000	99.97114300	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1679	NT1 _PYO FH ชุมสายบ้านถ้ำ	19.06251000	100.05477300	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1680	NT1 _PYO FH ชุมสายทุ่งต้นศรี	19.37536737	100.03979828	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1681	NT1 _PYO FH ดอกคำใต้	19.16739000	100.00190600	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1682	NT1 _PYO FH จุน	19.33748000	100.12769700	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1683	NT1 _PYO FH ปง	19.16136000	100.27826700	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3103	Lotus_PaSang	18.51339030	98.94211430	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1684	NT1 _PYO FH ท่าฟ้าใต้	19.01323000	100.27664800	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1685	NT1 _PYO FH เชียงม่วน	18.88621000	100.29708200	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1686	NT1 _PYO FH กิ่วชมภู	19.44373000	100.19191900	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1687	NT1 _PYO FH เชียงคำ	19.53203000	100.30440600	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1688	NT1 _PYO FH บ้านแฮะ	19.40662000	100.39830400	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1689	NT1 _PYO FH ชุมสายแม่กา	19.04893408	99.93542683	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1690	NT1 _PYO FH ภูซาง	19.59756000	100.32059400	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1691	NT1 _PYO FH แม่ใจ	19.34114000	99.81496800	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1692	NT1 _PYO FH ศูนย์ NT พะเยา2	19.21120000	99.87065900	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1693	NT1 _PYO FH ประตูชัย	19.17011825	99.90554074	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1694	NT1 _PYO FH ชุมสายแม่นาเรือ	19.13786000	99.83638200	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1695	NT1 _PYO FH ท่าวังทอง	19.17518000	99.91739400	NT1	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1696	ห้วยหม้อ	19.14344817	99.82398716	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1697	บ่อแฮ้ว	19.13937000	99.86048000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1698	pyo-pyo-24k01	19.07219723	99.88477080	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1699	บ้านโป่งขาม	19.24458600	99.85995300	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1700	บ้านแม่ใส	19.13410166	99.88371825	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1701	บ้านร่องคำหลวง	19.08126800	99.86810000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1702	แม่นาเรือ	19.11861530	99.84747295	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1703	แม่นาเรือ 2	19.11524217	99.85380714	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1704	แม่ใสเหล่าใต้	19.13162150	99.87690416	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1705	บ้านร่องคำน้อย	19.09179888	99.86434826	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1706	BigRock_บ้านดาวเรือง	19.12847868	99.93702838	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1707	Bigrock ป่าคา ม.2	19.31936700	99.83956800	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1708	ฺBigRock_สันทราย	19.31519200	99.84333500	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1709	BigRock_ปางปูเลาะ	19.35336260	99.71442570	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1710	BigRock_แม่ปืม	19.29354300	99.85486700	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1711	BigRock_ห้วยแก้วพัฒนา	19.36775400	100.08260400	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1712	ฺBigRock_ร่องดู่	19.33200800	100.13931400	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1713	BigRock ปางป้อม	19.41786000	100.12445000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1714	BigRock_ค้างหงษ์	19.30996464	100.16870457	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1715	BigRock_ธาตุขิงแกง	19.29531274	100.18816191	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1716	ฺBigRock_สบสา	19.52380700	100.36331200	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1717	BigRock_สิบสองพัฒนา	19.38637563	100.40672904	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1718	BigRock_น้ำมิน	19.42489100	100.43107400	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1719	BigRock_ปางมดแดง	19.52774000	100.16508000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1720	BigRock_สันปูเลย	19.57346450	100.20571010	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1721	BigRock_ทุ่งกล้วย	19.59282991	100.37512640	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2975	LPG_THE_OFFIC_FTTx01	17.62304594	99.23640683	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1722	BigRock_รพ.สต.น้ำปุก	19.18179000	100.45116300	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1723	BigRock  บ้านบอน	19.13793360	100.28738590	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1724	ฺBigRock_ไชยสถาน	18.87490700	100.30910200	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1725	ฺBigRock_นาบัว	18.97736800	100.14511600	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1726	Big Rock_บ้านท่าฟ้าใต้	19.01026966	100.28030390	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1727	ฺBigRock_แม่กา	19.04933900	99.93541700	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1728	BigRock_โพธิ์ทอง	19.05151600	100.03671100	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1729	ฺBigRock_ปางงุ้น	18.89600900	100.13707100	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1730	BigRock  บ่อเบี้ย	18.84818793	100.17414371	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1731	บ้านทุ่งรวงทอง	19.44112056	100.19095554	DE	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1732	บ้านสร้อยศรี	19.34145190	100.16925760	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1733	บ้านทุ่งรวงทอง 1	19.45866400	100.20370300	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1734	สักลอ	19.52438404	100.10039524	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1735	หงส์หิน	19.52034370	100.10496440	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1736	บ้านพวงพยอม	19.48237500	100.09750100	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1737	บ้านห้วยไคร้	19.40665135	100.17428516	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1738	บ้านดอนแก้ว	19.22428548	100.32134191	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1739	บ้านฝายแก้ว	19.21176924	100.32161117	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1740	บ้านเลี้ยว	19.24018317	100.36097595	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1741	บ้านดอนไชย	19.26020280	100.36693710	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1742	บ้านปัวAIS	19.24681985	100.35175873	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1743	ขุนควร	19.14888050	100.38387860	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1744	ควรดง	19.15869494	100.32157055	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1745	บ้านป่าคาใหม่	19.16409160	100.33574750	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1746	บ้านม่วง	19.12169691	100.26845822	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1747	บ้านห้วยแม่แดง	19.20364200	100.26884500	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1748	บ้านแม่วังช้าง	19.28072598	100.22400963	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1749	บ้านธาตุสันทุ่งใต้	19.28881305	100.19758947	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1750	บ้านมาง ม.5	18.91831350	100.27537247	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1751	บ้านสระ ม.3	18.93982000	100.24120390	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1752	บ้านทุ่งเย็น	19.45450378	100.34721126	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1753	บ้านแม่ลาว ม.8	19.42285563	100.36053735	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1754	ฝายกวาง	19.47364000	100.33541000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1755	วัดพระนั่งดิน	19.49762000	100.32502000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1756	ดงสุวรรณ	19.24111000	100.04811000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1757	บ้านคือเวียง ม.7	19.08337138	100.02732093	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1758	บ้านต้นตุ้ม	19.31058246	100.03088354	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1759	บ้านทุ่งต้นศรี	19.37587048	100.04019174	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1760	บ้านห้วยดอกเข็ม	19.25953558	100.02639055	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1761	ป่าซาง	19.27808000	100.04033000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1762	ศรีเมืองมูล	19.27787485	100.03175419	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1763	ห้วยลาน	19.31004100	100.03480700	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1764	จำไก่	19.17734000	100.07158000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1765	เกษตรสุข	19.08826547	99.89877477	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1766	บ้านภูเงิน	19.30771842	99.88625133	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1767	บ้านศรีถ้อย ม.7	19.35400172	99.80019009	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1768	บ้านสันจกปก ม.10	19.15446740	99.94037390	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1769	บ้านสันต้นม่วง	19.38674536	99.78269318	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1770	บ้านสันติสุข	19.36834400	99.79312700	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1771	บ้านสันป่าหนาด	19.13159018	99.95634837	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1772	บ้านสันหมื่นแก้ว	19.27902918	99.85594892	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1773	บ้านห้วยทรายเลื่อน	19.20110158	100.06137003	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1774	ส่ว่างอารมณ์ ม.6	19.18168300	99.98222000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1775	บ้านสานไซงาม	19.19405408	99.98217425	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1776	ห้วยบง	19.25632000	99.85218000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1777	ห้วยบงเหนือ	19.26267783	99.85734397	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1778	บ้านป่าฝาง	19.28784215	99.97776106	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1779	บ้านกาดถี	19.39830177	99.98456350	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1780	บ้านต้นแหน	19.42509700	98.98146000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1781	บ้านหนองลาว	19.31687000	100.00348000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1782	ห้วยแก้วหลวง	19.28899755	99.97029791	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1783	บ้านอิงโค้ง	19.34275433	100.00063115	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1784	ห้วยทรายขาว	19.37398100	99.99339200	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1785	หาดแฟน	19.35534831	99.99848626	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1786	บ้านดงอินตา	19.37522358	99.84390491	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1787	บ้านสันป่าม่วงAIS	19.38734224	99.78292393	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1788	บ้านหนองสระ	19.44389975	99.80444932	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1789	ป่าแฝก	19.42319495	99.76563559	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1790	ป่าแฝกนอก	19.42196100	99.76668800	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1791	บ้านร้องเชียงแรง	19.60001000	100.29665000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1792	บ้านยอดดอย	19.65037099	100.27929688	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1793	บ้านสถาน	19.62531000	100.34845000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1794	บ้านหนองเลา	19.63454000	100.36295000	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1795	บ้านสะแล่ง	19.62630958	100.29582980	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1796	บ้านหัวนา	19.62215657	100.40213499	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1797	บ้านชัยชมภูAIS	19.46790219	100.21031227	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1798	บ้านผาลาด	19.51122666	100.22092099	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1799	บ้านแม่ต๋ำ	19.48327313	100.24389983	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1800	บ้านแม่ต๋ำท่าข้าม	19.47634067	100.23228259	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1801	บ้านแวน	19.49118253	100.27008760	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1802	บ้านแวนศรีชุม	19.49432005	100.27015307	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1803	บ้านอ่างทอง	19.53161773	100.24955496	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1804	บ้านเกษตรสมบูรณ์	19.50371102	100.36174012	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1805	บ้านเจดีย์คำ ม.6	19.51724697	100.33769641	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1806	บ้านหนองป่าแพะ	19.50933020	100.35912878	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1807	บ้านงิ้ว	19.16381669	99.83282436	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1808	บ้านต๊ำ	19.21768649	99.83347044	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1809	บ้านต้ำกลางAIS	19.23397745	99.76755425	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1810	บ้านต้ำใน	19.24327541	99.75493317	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1811	บ้านบัว	19.14730000	99.83006800	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1812	บ้านผาช้างมูบ	19.18937970	99.81888713	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1813	บ้านสัน	19.24441815	99.83382068	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1814	บ้านสายน้ำงาม	19.24310866	99.81673506	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1815	บ้านห้วยทรายคำ	19.20584715	99.82213311	DE	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1816	ปางค่า_USO	19.38789141	100.40123700	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1817	BSWM	19.16525000	99.84669140	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1818	ปง (FTTX)	19.15393333	100.27493272	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1819	เชียงม่วน (Fttx)	18.88526035	100.29197333	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1820	จุน (FTTX)	19.34284130	100.13179840	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1821	เชียงคำ(FTTX)	19.52731230	100.30979750	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1822	ดอกคำใต้(FTTX)	19.16509400	100.00055100	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1823	 แม่ใจ1	19.33975702	99.81246730	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1824	 บ้านต๋อม	19.19751324	99.84004076	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1825	บ้านใหม่ FTTx	19.26684159	99.81957967	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1826	Fttx_Mea ink	19.22599983	99.96064781	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1827	บ้านเจน (FTTx)	19.24490895	99.96614296	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1828	PYO_CAB#014-	19.15272747	99.91249345	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1829	PYO_Namo	19.02656116	99.92365444	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1830	PYO_BPIN	19.04854086	100.04612355	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1831	PYO_MSU3	19.32536261	99.79473981	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1832	เชียงคำ(Cab#2) FTTx	19.52322352	100.30061991	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1833	PG12	19.68827447	100.41134950	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1834	ภูซาง FTTx	19.61976341	100.35017849	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1835	สภอ.ดอกคำใต้ SPC	19.16228640	99.99023137	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1836	PYO_FaiKwang_M8	19.40373695	100.30128043	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1837	ท่าวังทอง	19.18819223	99.92960147	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1838	ศูนย์ราชการ SPC	19.19183000	99.87904000	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1839	โยธา	19.19637959	99.88259561	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1840	MTAM	19.13781638	99.91118582	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1841	เชียงบาน ม.9 (FTTx)	19.50126943	100.28027031	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1842	ร่องแมด (FTTx)	19.44958848	100.12888342	NT2	พะเยา	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1843	 สบบง (FTTx)	19.57129390	100.30167222	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1844	 จำป่าหวาย ม.5 fttx	19.10825660	99.94256767	NT2	พะเยา	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1845	NT1_วังซ่าน1	15.84050000	99.64222000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1846	หนองบอนใต้	15.86248100	99.69517100	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1847	NT1_ตลุกข่อยนํ้า	15.89854000	99.55748800	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1848	NT1_วังหิน	15.68720000	99.70635000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1849	แม่เปิน	15.66892600	99.45213700	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1850	ชุมตาบง	15.63134600	99.55211700	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1851	พุนกยุง	15.42645200	100.46192400	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1852	โพธิ์ประสาท	15.41300800	100.55783000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1853	ลำพยนต์	15.30755400	100.58488000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1854	บ่อไทย	15.43858400	100.62824100	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1855	ตากฟ้า	15.33840300	100.49062100	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1856	NT1_หนองเบน	15.76400000	99.98620000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1857	บรรพต	15.94272500	99.98696400	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1858	NT1_หนองสังข์	15.87947000	99.90354800	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1859	NT1_ไพศาลี	15.59739000	100.64374900	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1860	นาขนอม	15.71848000	100.80198000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1861	ตะคร้อ	15.45903300	100.72290200	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1862	NT1_บ้านเขาดิน	15.72913000	100.72967200	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1863	NT1_หนองตางู	16.13090000	100.06367000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1864	หนองแพงพวย	15.95297400	100.11715000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1865	แม่วงก์	15.78490300	99.51948200	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1866	เขาชนกัน	15.89497000	99.47149900	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1867	ปางสวรรค์	15.70456500	99.54999500	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1868	จันเสน	15.12266400	100.45884400	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1869	ห้วยหอม	15.22241000	100.47499900	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1870	ช่องแค	15.16466000	100.42246000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1871	ตลาดใต้	15.68390800	100.09651600	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1872	โพนทอง (โรงปูน)	15.22367300	100.36403100	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1873	ย่านมัทรี	15.54741000	100.12700000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1874	หนองปรือ	15.73031600	100.03343400	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1875	ชุมแสง	15.88260000	100.30300000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1876	NT1_เกยไชย	15.86860000	100.26091800	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1877	NT1_หนองบัว	15.86900000	100.59900000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1878	NT1_ห้วยร่วม	15.87281000	100.44061500	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1879	NT1_บ้านหนองไผ่	15.83966000	100.68601600	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1880	NT1_บ้านไร่ห้วยถั่ว	15.90011000	100.60564600	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1881	NT1_โกรกพระ	15.56100000	100.06800000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1882	ท่าซุด	15.63839000	100.03109000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1883	NT1_วังม้า	15.67900000	99.83520000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1884	ลาดยาว	15.74770000	99.79090000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1885	ศาลเจ้าไก่ต่อ	15.79120600	99.68365700	NT1	นครสวรรค์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1886	NT1_พยุหะคีรี	15.45500000	100.13800000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1887	NT1_นิคมเขาบ่อแก้ว	15.49028000	100.24121500	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1888	NT1_ท่าตะโก	15.64100000	100.48900000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1889	เขาขาด(ท่าตะโก)	15.59123600	100.36839900	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1890	NT1_สายลำโพงใต้	15.75198000	100.44767800	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1891	NT1_หนองหัวเรือ	15.84370000	100.12288400	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1892	เก้าเลี้ยว	15.85150000	100.07500000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2976	LPG_CHM_FTTx01	18.70749559	99.57724045	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1893	NT1 _บ้านเขาดินเหนือ	15.82954000	100.07279000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1894	NT1_บ้านคลองยาง	15.90620200	100.20013200	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1895	วัดโพธาราม	15.70377600	100.14036300	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1896	ศาลากลางนครสวรรค์	15.69191607	100.11389890	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3421	test	18.32120414	99.42457624		ลำปาง	ทั่วไป	2026-03-09 04:38:49.333552	t	505e312c-181f-48e8-b8d8-5778df42e0b0	{}
1897	วิมานแมน	15.69958000	100.12831000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1898	สค.นครสวรรค์	15.70951000	100.11506000	NT1	นครสวรรค์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1899	NT1_สถานีรถไฟนครสวรรค์	15.66286000	100.16242600	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1900	หนองปลิง	15.66553800	100.14683600	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1901	บึงบอระเพ็ด	15.73089000	100.18952500	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1902	บึงน้ำใส	15.80364400	100.12156400	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1903	ทับกฤช	15.75087700	100.24898200	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1904	การเคหะฯ	15.71676700	100.09662200	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1905	หัวครัก	15.63510350	100.26552700	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1906	วัดถือน้า	15.66731800	100.10880500	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1907	นครสวรรค์ลากูล	15.73410100	100.09894200	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1908	ทางหลวงชนบท	15.65262300	100.13140800	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1909	เขาทอง	15.57329400	100.17836300	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1910	NT1_ด่านช้าง	16.04669000	100.02035100	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1911	หัวหวาย	15.35023133	100.31501030	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1912	อุดมธัญญา	15.48175300	100.41882300	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1913	สค.ตาคลี	15.26140000	100.32900000	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1914	หนองโพ	15.37559700	100.25161000	NT1	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1915	เขาใบไม้	15.26863000	100.34862200	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1916	บ้านพักกองบิน4	15.26935200	100.31163700	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1917	ชอนเดื่อ	15.29317850	100.38794300	NT1	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1918	nsn-csnkj2-24k01	15.90236314	100.42018170	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1919	nsn-bpdch1-24k01	16.04733204	100.01714720	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1920	nsn-klnta-24k01	15.95298020	100.11643560	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1921	nsn-klhud-24k01	15.88262044	100.05887530	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1922	nsn-bmkl2-24k01	15.81639121	100.08236400	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1923	nsn-csbk2-24k01	15.90570512	100.19717260	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1924	nsn-nswt-24k01	15.64140825	100.06572790	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1925	nsn-bpbpt1-24k01	16.07750740	100.05118780	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1926	nsn-bpdch3-24k01	16.07944561	99.97655325	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1927	nsn-bpdch2-24k01	16.10176236	99.99244680	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1928	nsn-bpptl-24k01	16.09685021	100.08851780	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1929	nsn-csnkj3-24k01	15.88279378	100.39432060	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1930	nsn-bpntn1-24k01	16.12594437	100.04712730	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1931	nsn-bpnkr2-24k01	15.97078720	100.09803040	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1932	nsn-tkhl1-24k01	15.62808359	100.08853460	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1933	nsn-tkhl2-24k01	15.61646058	100.08294960	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1934	nsn-bmf-24k01	15.59196316	100.09519980	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1935	nsn-kpkcn-24k01	15.58843043	100.02591430	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1936	nsn-bnphn-24k01	15.53688437	100.03380200	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1937	nsn-kpnkp1-24k01	15.52855381	99.98885057	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1938	nsn-kpnkp2-24k01	15.57883959	99.98762154	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1939	nsn-kphs-24k01	15.50496579	99.98602307	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1940	nsn-cspsg-24k01	15.87566800	100.41780850	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1941	nsn-ykh-24k01	15.55020415	100.10749350	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1942	nsn-ykh6-24k01	15.51561972	100.09151280	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1943	nsn-cspsg1-24k01	15.84947288	100.36045450	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1944	nsn-bbp1-24k01	15.72186649	100.15150460	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1945	nsn-ngp1-24k01	15.65088307	100.15758240	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1946	nsn-ngp2-24k01	15.67434113	100.21040270	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1947	nsn-prn9-24k01	15.63573723	100.25843710	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1948	nsn-bnkt-24k01	15.55164923	100.18315100	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1949	nsn-btht1-24k01	15.66132819	100.07071320	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1950	nsn-bpmg-24k01	15.64524264	100.03299050	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1951	nsn-kpnkg1-24k01	15.63735763	99.99772647	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1952	nsn-kpnkg2-24k01	15.65948221	99.98828480	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1953	nsn-csthm-24k01	15.90316684	100.26989250	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1954	nsn-bake-24k01	15.77418884	100.08328040	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1955	nsn-bkg2-24k01	15.75353039	100.07002920	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1956	nsn-bkg-24k01	15.79727801	100.04986700	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1957	nsn-bns3-24k01	15.77388814	100.12150980	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1958	nsn-nsnbsn2-24k01	15.74962758	100.13851220	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1959	nsn-bns2-24k01	15.80308163	100.12234870	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1960	nsn-bbp1str-24k01	15.72766123	100.20629610	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1961	nsn-nkr4-24k01	15.72395782	100.04180680	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1962	nsn-thcp-24k01	15.69090428	99.99331575	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1963	nsn-ngb-24k01	15.76632400	99.98795100	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1964	nsn-thh1-24k01	15.80072223	100.57263620	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1965	nsn-sutp2-24k01	15.77593971	99.94013783	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1966	nsn-sutp1-24k01	15.75036330	99.94591062	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1967	nsn-pnnkd1-24k01	15.80510065	99.98179292	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1968	nsn-pnnkd2-24k01	15.81078846	99.95302399	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1969	nsn-nm-24k01	15.81532868	99.94319926	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1970	nsn-nmkmn-24k01	15.80865350	99.91517683	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1971	nsn-stl-24k01	15.50171937	100.15766250	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1972	nsn-nmk-24k01	15.47190230	100.16792580	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1973	nsn-nkb-24k01	15.47037866	100.23493090	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1974	nsn-nknmd-24k01	15.50451656	100.21683180	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1975	nsn-cspsg2-24k02	15.83033497	100.35955470	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1976	nsn-pyhnk1-24k01	15.44595841	100.22844950	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1977	nsn-pyhns2-24k01	15.42598612	100.13327430	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1978	nsn-pyhns1-24k01	15.46452802	100.10526200	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1979	nsn-tno-24k01	15.41745732	100.13661390	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1980	nsn-cspsg3-24k01	15.85527992	100.32446440	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1981	nsn-csthm1-24k01	15.91574464	100.24653420	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1982	nsn-ttktn1-24k01	15.64635670	100.51980000	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1983	nsn-ttktn2-24k01	15.58640204	100.55212390	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1984	nsn-pslkd1-24k01	15.62155991	100.57724020	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1985	nsn-ttkdk1-24k01	15.69849919	100.58377850	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1986	nsn-ttkslp1-24k01	15.73151171	100.50785420	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1987	nsn-ttkpnr2-24k01	15.69519397	100.46352450	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1988	nsn-ttkpnr3-24k01	15.70305170	100.39898460	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1989	nsn-ttkpnr1-24k01	15.72070495	100.44764210	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1990	nsn-ttknl1-24k01	15.53139371	100.47888840	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1991	nsn-ttkhtn3-24k01	15.59131259	100.37549350	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1992	nsn-csthm3-24k01	15.87663835	100.24902770	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1993	nsn-ttkwmk2-24k01	15.63681124	100.38422400	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1994	nsn-ttkhtn2-24k01	15.59408142	100.45213270	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1995	nsn-ttkwmk1-24k01	15.64389182	100.36804140	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1996	nsn-tfpny1-24k01	15.39853478	100.46332730	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1997	nsn-ttknl2-24k01	15.44406459	100.50241960	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1998	nsn-pslpps2-24k01	15.45053655	100.52609320	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1999	nsn-tfpny2-24k01	15.36065316	100.45462160	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2000	nsn-pslsrc3-24k01	15.56179891	100.65581820	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2001	nsn-pslkd2-24k01	15.59352968	100.64237610	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2002	nsn-pslsrc2-24k01	15.52889057	100.64991000	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2003	nsn-csthm4-24k01	15.91783596	100.28177390	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2004	nsn-pslsrc-24k01	15.53180912	100.61332280	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2005	nsn-src4-24k01	15.56730654	100.59052210	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2006	nsn-psltk3-24k01	15.45165046	100.69640950	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2007	nsn-psltk4-24k01	15.51461498	100.78630590	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2008	nsn-pslwk1-24k01	15.59988641	100.74026220	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2009	nsn-pslwk2-24k01	15.64057454	100.77920120	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2010	nsn-pslpsl1-24k01	15.71468773	100.82936580	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2011	nsn-wnl-24k01	15.67658407	100.61992360	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2012	nsn-pslwnl1-24k01	15.51626999	100.69795850	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2013	nsn-pslnk-24k01	15.68999017	100.73085540	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2014	nsn-cstkr1-24k01	15.76779313	100.29241630	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2015	nsn-pslnk2-24k01	15.51827666	100.78300240	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2016	nsn-tfssr1-24k01	15.37018525	100.53987330	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2017	nsn-pslpps3-24k01	15.38844914	100.55622500	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2018	nsn-tflpy8-24k01	15.33163723	100.55308760	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2019	nsn-tflpy2-24k01	15.30861030	100.58361520	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2020	nsn-tflpy3-24k01	15.26519946	100.56734380	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2021	nsn-pslpps1-24k01	15.41192291	100.55810890	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2022	nsn-pslpps4-24k01	15.42471554	100.53557170	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2023	nsn-pslpps5-24k01	15.43810430	100.62790350	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2024	nsn-pslpps6-24k01	15.39163805	100.61900270	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2025	nsn-cspln1-24k01	15.81891790	100.25680970	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2026	nsn-tfkcl4-24k01	15.28950291	100.43284700	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2027	nsn-tfkct1-24k01	15.25898813	100.42530920	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2028	nsn-kct-24k01	15.29925327	100.44792170	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2029	nsn-tfkct2-24k01	15.29809534	100.46205350	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2030	nsn-tfkct3-24k01	15.32597409	100.44247970	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2031	nsn-tktk2-24k01	15.29493886	100.38944470	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2032	nsn-npk3-24k01	15.33381083	100.41378890	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2033	nsn-npk-24k01	15.35194118	100.41394590	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2034	nsn-tkhw9-24k01	15.28891610	100.31792060	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2035	nsn-tkhw7-24k01	15.32445795	100.31146100	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2036	nsn-cspln2-24k01	15.83212651	100.28173830	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2037	nsn-tkbnm-24k01	15.24090700	100.29515930	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2038	nsn-tkbnm2-24k01	15.21968372	100.32143870	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2039	nsn-tkbnm3-24k01	15.19096466	100.32741060	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2040	nsn-tktk1-24k01	15.22717207	100.37687170	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2041	nsn-tkbkf-24k01	15.20923019	100.41164220	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2042	nsn-tkhw6-24k01	15.32274423	100.33376650	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2043	nsn-thhw2-24k01	15.34338958	100.29174020	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2044	nsn-tkhw3-24k01	15.35511091	100.25055530	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2045	nsn-tkhw8-24k01	15.39538000	100.33299000	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2046	nsn-tknp-24k01	15.38128272	100.25169910	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2047	nsn-cspln3-24k01	15.84090788	100.25982250	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2048	nsn-tkck1-24k01	15.18484748	100.45043970	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2049	nsn-tkck4-24k01	15.17029863	100.46431310	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2050	nsn-tkcs1-24k01	15.13686486	100.41308140	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2051	nsn-tkdm1-24k01	15.11731980	100.42501150	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2052	nsn-tkst1-24k01	15.11534183	100.40961610	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2053	nsn-tkst2-24k01	15.12864141	100.37543840	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2054	nsn-tkhh5-24k01	15.22266602	100.47310120	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2055	nsn-tkhh6-24k01	15.26079742	100.49316500	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2056	nsn-tftf1-24k01	15.27474032	100.50498890	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2057	ตากฟ้าลำพยนต์5-24k01	15.19887549	100.53748690	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2058	nsn-cskch1-24k01	15.86194296	100.26881580	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2059	ตากฟ้าลำพยนต์4-24k01	15.21785322	100.54890850	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2060	nsn-cskch2-24k01	15.86797017	100.26123320	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2061	nsn-cskom1-24k01	15.83836115	100.24341560	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2062	nsn-nbhtn-24k01	15.85165969	100.49365800	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2063	nsn-nbhr2-24k01	15.89167399	100.50288690	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2064	nsn-nbhr1-24k01	15.92173437	100.52322920	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2065	nsn-nbhr3-24k01	15.90437873	100.44423760	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2066	nsn-wab1-24k01	15.83878824	100.69720750	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2067	nsn-wab2-24k01	15.85556481	100.71987750	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2068	nsn-wab3-24k01	15.88380848	100.77640640	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2069	nsn-wab4-24k01	15.80412048	100.68954030	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2070	nsn-wab5-24k01	15.81484269	100.74651280	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2071	nsn-thh2-24k01	15.80396191	100.61316520	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2072	nsn-thh3-24k01	15.81603125	100.53383020	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2073	nsn-tht1-24k01	15.91401946	100.68350780	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2074	nsn-tht2-24k01	15.89450254	100.69403800	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2075	nsn-nkr1-24k01	15.97310315	100.62641090	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2076	nsn-nkr2-24k01	15.92487746	100.61395420	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2077	nsn-nnw-24k01	15.76401000	99.88424986	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2078	nsn-lyowdd-24k01	15.67797893	99.90485687	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2079	nsn-lyonhc-24k01	15.73625774	99.87729117	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2080	nsn-lyonnw2-24k01	15.74928702	99.89522269	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2081	nsn-lyohry-24k01	15.75970772	99.82836395	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2082	nsn-lyobnr-24k01	15.80026932	99.81451646	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2083	nsn-bar-24k01	15.84186121	99.81630583	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2084	nsn-lyosrk-24k01	15.71655915	99.80093658	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2085	nsn-lyomak-24k01	15.67853695	99.80599403	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2086	nsn-lyohnh2-24k01	15.69951709	99.72260315	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2087	nsn-lyoskl-24k01	15.70080543	99.66004901	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2088	nsn-lyotls-24k01	15.66098807	99.61874627	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2089	nsn-ctb-24k01	15.63110632	99.55289125	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2090	nsn-ctbchm-24k01	15.74993457	99.53632004	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2091	nsn-cskm1-24k01	15.95169316	100.30332010	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2092	nsn-ctbhgp-24k01	15.70876285	99.51075319	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2093	nsn-map12-24k01	15.65881452	99.47071959	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2094	nsn-map18-24k01	15.72575013	99.39348956	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2095	nsn-mapkpt-24k01	15.70897539	99.46105156	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2096	nsn-mwbpn-24k01	15.72822625	99.46746287	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2097	nsn-maw-24k01	15.78184757	99.51958916	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2098	nsn-cskm2-24k01	15.95251970	100.31598240	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2099	nsn-mwmrsm-24k01	15.80200381	99.51143938	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2100	nsn-wmk-24k01	15.89724208	99.56793173	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2101	nsn-wgs-24k01	15.84889035	99.64000667	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2102	nsn-mwwstk-24k01	15.83228308	99.60207217	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2103	nsn-lywmst-24k01	15.77276977	99.63073115	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2104	nsn-lyns19-24k01	15.84507681	99.71034899	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2105	nsn-bura-24k01	15.72214494	99.61605929	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2106	nsn-lytmn-24k01	15.76928552	99.72112470	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2107	nsn-lyhnh-24k01	15.74124236	99.51854082	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2108	nsn-cspk1-24k01	15.90933907	100.33295830	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2109	nsn-lyblo-24k01	15.77388592	99.78961565	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2110	nsn-bppns-24k01	15.87852137	99.89793259	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2111	nsn-bppkhl-24k01	15.92438021	99.87541289	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2112	nsn-bppktt-24k01	15.95948232	99.83786837	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2113	nsn-bpptng1-24k01	15.92009431	99.93455139	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2114	nsn-bppot1-24k01	15.86947333	99.95362439	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2115	nsn-bppbda-24k01	15.95731547	99.91224140	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2116	nsn-bppbka1-24k01	15.99840588	99.85712875	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2117	nsn-bppbhk-24k01	15.89207000	100.01194310	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2118	nsn-csnkj1-24k01	15.91319995	100.36355220	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2119	nsn-bpcrp-24k01	15.98651272	100.00927920	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2120	nsn-bptsa1-24k01	15.99040656	99.96442651	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2121	nsn-bptkh1-24k01	15.97373597	99.95509091	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2122	nsn-bptkh2-24k01	16.00108461	99.87291804	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2123	nsn-bppnk1-24k01	15.99689699	100.07566730	DE	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2124	nsn-bpbtn1-24k01	15.92162521	100.00770850	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2125	nsn-bpl-01	16.01961173	100.11478830	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2126	nsn-klkon1-15k1	15.84872180	100.04915430	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2127	nsn-tdd-150k01	15.78676329	100.18294910	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2128	nsn-tkcs-01	15.12391579	100.45774050	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2129	nsn-tkltr-01	15.15180829	100.50179030	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2130	nsn-ctbpsw-15k01	15.70387647	99.55124221	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2131	nsn-mplmn-01	15.66766995	99.44609616	DE	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2132	nsn-tkl-USO487	15.70830817	100.11508530	NT2	นครสวรรค์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2133	nsn-ctb-nsn-byy-uso3k01	15.75458666	99.42774848	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2134	nsn-mle-nsn-pkn-uso3k01	15.82228717	99.39413552	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2135	nsn-mle-nsn-pmrk-uso3k01	15.84242786	99.42306801	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2136	nsn-mle-nsn-m123-uso3k01	15.86957954	99.39948362	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2137	nsn-ctb-nsn-mks-uso3k01	15.73344923	99.36763931	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2138	TOT_USO_	15.90358228	99.40066323	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2139	nsn-nplp-uso3k01	15.77490125	100.49586640	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2140	nsn-ttk-USO499	15.70459515	100.14189440	NT2	นครสวรรค์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2141	PhaiSaLee	15.59518438	100.65749150	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2142	ช่องแค_ChongKae	15.16400654	100.42400600	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2143	nsn_fttx_tubkrid	15.75106290	100.25350660	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2144	บรรพตพิสัย2 CAB#001	15.94174669	99.98408245	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2145	อบต.หนองปลิง FTTx	15.65756098	100.15847576	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2146	nsn2_Cab#027(รร.นครสวรรค์)	15.51796444	100.13446390	NT2	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2147	nsn2_cab#020 (นครสวรรค์2 CAB 020)	15.70755461	100.12917740	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2148	ตาคลี CAB#012 FTTx	15.26518077	100.34746072	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2149	นภาFTTx	15.68360000	100.06157000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2150	เอกอำพร FTTx	15.72441680	100.04746563	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2151	อภิทาวน์FTTx	15.74231000	100.09694000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2152	ศุภาลัยFTTx	15.72515000	100.10453000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2153	เก้าเลี้ยวเมืองใหม่ FTTx	15.86920000	100.11678000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2154	บ้านโปร่งสวรรค์FTTx	15.47886274	100.27389561	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2155	วัดชุมแสงFTTx	15.90005556	100.30384063	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2156	พนมเศษFTTx	15.71305074	100.34489151	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2157	ดีพร้อม2FTTx	15.67100000	100.09073000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2158	บ้านยางตาล (FTTx)	15.57505955	100.12408469	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2159	สระแก้วFTTx	15.76680000	99.79894000	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2160	ท่าน้ำอ้อย	15.41725564	100.13689020	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2161	ย่านมัทรี FTTX	15.51447000	100.12580500	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2162	ชุมแสง_C600	15.89367430	100.30828010	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2163	หนองบัว_C600	15.86661951	100.58713212	NT2	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2164	ตากฟ้า_C600	15.35463268	100.50883402	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2165	ท่าตะโก_C600	15.63667306	100.47643310	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2166	ตาคลี_C600	15.26408445	100.33705380	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2167	พยุหะคีรี_C600	15.45969834	100.13896690	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2168	ลาดยาว_C600	15.74840775	99.78687954	NT2	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2169	บ้านวัดเขา_C600	15.66921574	100.12887878	NT2	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2170	โกรกพระ_C620	15.56038261	100.06951008	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2171	บรรพคพิสัย_C620	15.92794457	99.97512636	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2172	เก้าเลี้ยว_C620	15.85032219	100.08115770	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2173	เจ้าพระยา_C620	15.71260511	100.07054683	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2174	BIG-C VSQUARE	15.69540540	100.12106100	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2175	WangPhai(Replace)	15.68811780	100.08592840	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2176	โรงพยาบาลตาคลี(Replace) FTTx	15.24211478	100.35218686	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2177	KhaoThong_v2	15.57426162	100.18165620	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2178	NSN_o_Karunrangsi_v2	15.67379401	100.09978290	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2179	KANKEHA	15.51817348	100.10932180	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2180	ชส.ตาคลี CAB008	15.25967600	100.34928700	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2181	NSN_o_DreamLand_v2_	15.71665655	100.09634700	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2182	บ้านวัดเขา 2 (หน้าแมคโคร)	15.68118259	100.12807790	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2183	CHONG KHAE2	15.16855103	100.41591130	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2184	วัดนครสวรรค์	15.70146902	100.13431368	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2185	บ้านพักศาลตุลาการ FTTx	15.69881286	100.10744782	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2186	NSN_KYI (บ้านแควใหญ่)	15.69905564	100.14253759	NT2	นครสวรรค์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2187	NSN-takhro-v2	15.45874304	100.72386780	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2188	chumtabong	15.63057151	99.55258329	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2189	ZTE ริมปิงวัดเทพ FTTx	15.73261274	100.11886411	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2190	nsn-clfn-01	15.72595508	100.10755397	NT2	นครสวรรค์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2191	NPL	15.65255562	100.18035650	NT2	นครสวรรค์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2192	NT1_บ้านใหม่ วังน้ำคู้	16.68260000	100.27432100	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2193	NT1_XGPON - พลายชุมพล	16.85960000	100.21525000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2194	 NT1_นครชุม	17.29540000	100.82964900	NT1	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2195	NT1_ปลักแรด	16.68100000	100.09721000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2196	NT1_นาทอง	16.77617000	100.26373000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2197	NT1_บ้านพิกุล	16.75000000	100.28200000	NT1	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2198	NT1_ทะเลแก้ว	16.83601600	100.22743900	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2199	NT1_สนง.พิษณุโลก (ริมน้ำ)	16.81815633	100.26034495	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2200	NT1_บิ๊กซี โคกช้าง	16.81513000	100.28859900	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2201	NT1_บ้านแยง	16.88716000	100.79122300	NT1	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2202	NT1_คลองหนองเหล็ก มน.	16.73883000	100.18942700	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2203	NT1_แก่งจูงนาง	16.83771800	100.56306000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2204	NT1_ไผ่ใหญ่รักไทย	16.73678662	100.62984226	NT1	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2205	NT1_บ้านป่า	16.92608700	100.35533800	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2206	NT1_บางระกำ	16.75431000	100.12165800	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2207	NT1_หนองตม	17.09702470	100.16915200	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2208	NT1_พรหมพิราม	17.03890000	100.20049400	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2209	NT1_วัดโบสถ์	16.98884000	100.31413200	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2210	NT1_หัวรอ	16.85425000	100.26401000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2211	NT1_ชาติตระการ	17.27601000	100.60053700	NT1	พิษณุโลก	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2212	NT1_นครไทย	17.10400940	100.83771190	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2213	NT1_แก่งหว้าแก่งไฮ	16.98550110	100.75109071	NT1	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2214	NT1_นาตาดี	17.14822000	100.95316700	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2215	NT1_บ้านชาน	17.12134000	100.35473100	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2216	NT1_ทรัพย์ไพรวัลย์	16.89362321	100.65395878	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2217	NT1_กกไม้แดง	16.76730000	100.43130000	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2218	NT1_เขาสมอแคลง	16.84052900	100.40352770	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2219	NT1_เนินมะปราง	16.56773000	100.63849000	NT1	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2220	NT1_บางกระทุ่ม	16.58509720	100.29896500	NT1	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2221	plk-pcp-24k04 บ้านตาลสุวรรณ	16.85917000	100.30983000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2222	plk-bhk-24k06 บ้านห้วยแก้ว บ้านแยง	16.96508000	100.80560000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2223	plk-npo-24k03 บ้านนาโพธิ์ นครไทย	17.03336000	100.82631000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2224	plk-nng-24k04 บ้านนาหนอง	17.08409000	100.76741000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2225	plk-htt-24k05 บ้านห้วยตีนตั่ง นครไทย	17.04939000	100.90929000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2226	plk-bhm-24k01 บ้านหัวเมือง เนินเพิ่ม	17.12349000	100.89510000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2227	plk-btr-24k02 บ้านบุ่งตารอด เนินเพิ่ม	17.15469000	100.90608000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2228	plk-byk-24k03 บ้านยางโกลน เนินเพิ่ม	17.18510500	100.91674000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2229	plk-bpo-24k04 บ้านบ่อโพธิ์ เนินเพิ่ม	17.14921000	100.95376000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2230	plk-bnl-24k05 น้ำเลา เนิ่นเพิ่ม	17.18878000	101.00468000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2231	plk-bkg-24k05 บ้านกร่าง พลายชุมพล	16.87999000	100.20318000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2232	plk-nbu-24k01 บ้านนาบัว นาบัว	17.18867000	100.87877000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2233	plk-bnk-24k03 บ้านนาคล้อ นาบัว	17.23737000	100.87095000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2234	plk-bnm-24k04_นาเมือง	17.29497729	100.82940303	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2235	plk-nuk-24k05 บ้านน้ำกุ่ม (SW24K-นาบัว)	17.34303000	100.85841000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2236	plk-bnf-24k06 บ้านนาแฝก	17.36793441	100.87695826	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2237	plk-tsk-24k01 บ้านท่าสะแก ชาติตระการ	17.25202000	100.63062000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2238	plk-bctk-24k02 บ้านชาติตระการ	17.29084231	100.63716503	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2932	lpg_bak_FTTx01	18.09383469	99.48919227	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2239	plk-nkt-24k02 บ้านพร้าว นครไทย	17.12544000	100.77493000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2240	plk-naj-24k03 บ้านนาจาน ชาติตระการ	17.32891000	100.69992000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2241	plk-hhn-24k04 บ้านห้วยเหิน ชาติตระการ	17.25806000	100.55947000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2242	plk-nmk-24k01 บ้านหนองมะคัง วัดโบสถ์	16.95452000	100.32070000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2243	plk-bnk-24k01 บ้านนาขุม พรหมพิราม	16.97604000	100.14501000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2244	Big Rock บ้านคลองมะเกลือ (ZTE)	17.14747243	100.14656354	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2245	 BigRock บ้านวังมะด่าน	16.81708302	100.26112621	DE	พิษณุโลก	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2246	 Big Rock บ้านตลุกเทียม	17.14990000	100.08358000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2247	 Big Rock บ้านท้องโพลง	17.19210000	100.18917000	DE	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2248	plk-bkd-24k01 บ้านบึงกระดาน อินโดจีน	16.90589000	100.32924000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2249	 Big Rock บ้านหนองมะคัง (ทับยายเชียง)	17.10790000	100.28290000	DE	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2250	 BigRock บ้านสนามคลี	16.53813466	100.25312815	DE	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2251	plk-ndg-24k02 บ้านในดง อินโดจีน	16.94408000	100.38087000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2252	plk-rmn-24k03 บ้านดอนทอง อินโดจีน	16.90085000	100.35716000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2253	plk-sak-24k04 บ้านสะอัก อินโดจีน	16.86870254	100.35538825	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2254	plk-dpi-24k05 บ้านดงไผ่ อินโดจีน	16.77841000	100.34080000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2255	plk-kpd-24k06 บ้านคลองเป็ด อินโดจีน	16.76170600	100.35197000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2256	plk-nkt-24k01 บ้านป่าซ่าน นครไทย	17.11365000	100.78928000	DE	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2257	plk-bnp-24k06 บ้านหนองปลิง พลายชุมพล	16.81333489	100.14818096	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2258	plk-bbk-24k07 บ้านบางแก้ว พลายชุมพล	16.82392000	100.13394000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2259	plk-bps-24k02 บ้านพันเสา ปลักแรด	16.65566000	100.08925000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2260	plk-nbsb-24k03 บ้านหนองบัวสีบาท ปลักแรด	16.63076200	100.06161000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2261	plk-npd-24k04 บ้านหนองประดู่ ปลักแรด	16.59998000	100.07723200	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2262	plk-bnn-24k05 บ้านหนองนา ปลักแรด	16.60998000	100.14924000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2263	plk-bnb-24k06 บ้านหนองบัว ปลักแรด	16.63519074	100.15727493	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2264	plk-chk-24k01 บ้านชุมแสงสงคราม	16.80559000	100.02668000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2265	บ้านห้วยกระได	16.78404597	100.03827068	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2347	TOT-004_ บ้านปากพาน	17.23591201	100.33544007	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2266	plk-nkn-24k04 บ้านหนองขานาง ชุมแสงสงคราม	16.84427000	100.01863000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2267	plk-byj-24k05 บ้านยิ่งเจริญ ชุมแสงสงคราม	16.81483000	99.97596000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2268	plk-mjt-24k06 บ้านใหม่เจริญธรรม ชุมแสงสงคราม	16.77845000	99.93418000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2269	plk-nkp-24k07 บ้านนิคมพัฒนา ชุมแสงสงคราม	16.73667000	99.93406000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2270	plk-bkj-24k08 บ้านเกาะจันทร์ ชุมแสงสงคราม	16.73857000	100.00486000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2271	plk-bsh-24k01 บ้านเสาหิน ม.นเรศวร	16.72791000	100.23273000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2272	plk-ptg-24k02 บ้านพวงทอง ม.นเรศวร	16.69503000	100.19459000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2273	plk-kyn-24k03 บ้านกระทุ่มยอดน้ำ ม.นเรศวร	16.67618700	100.18548000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2274	plk-bpp-24k01 บ้านปากพิง บ้านใหม่	16.65607044	100.23410680	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2275	plk-wak-24k02 บ้านวัดขวาง บ้านใหม่	16.62209000	100.25291000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2276	plk-wnk-24k03 บ้านวังน้ำคู้ บ้านใหม่	16.66104000	100.27774000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2277	plk-nsa-24k04 บ้านเนินสะอาด บ้านใหม่	16.69107000	100.31389000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2977	LPG_WNA_FTTx01	19.14460566	99.61946108	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2760	Big_Rock_บ้านแม่และ	18.40150000	98.11513000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2278	plk-wns-24k05 บ้านวังน้ำใส บ้านใหม่	16.71742900	100.31988000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2279	plk-bpl-24k06 บ้านปากลาด บ้านใหม่	16.73542000	100.29180000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2280	plk-btt-24k07 บ้านท่าตาล บ้านใหม่	16.64401000	100.32110000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2281	plk-bkk-24k08 บ้านโกรงเกรง บ้านใหม่	16.62248000	100.36724000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2282	plk-brk-24k01 บ้านปลักแรด	16.68020426	100.09844398	DE	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2283	plk-bbp-24k01 บ้านบึงพิง ชุมแสงสงคราม	16.67160000	99.91716000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2284	plk-bkr-24k02 บ้านหนองกุลา ชุมแสงสงคราม	16.64059000	99.94919000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2285	plk-ksl-24k01 โคกสลุด บางกระทุ่ม	16.57843000	100.25498000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2286	plk-bri-24k01 บ้านไร่ บางกระทุ่ม	16.61404000	100.25540000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2395	NT2_ท่าโพธิ์	16.75494000	100.19644220	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2287	plk-bbr-24k03 บ้านบึงลำ บางกระทุ่ม	16.60522000	100.33284000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2288	plk-bsr-24k04 บ้านสามเรือน บางกระทุ่ม	16.59555000	100.35228000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2289	plk-tmk-24k05 บ้านท่ามะขาม บางกระทุ่ม	16.57535000	100.34394000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2290	plk-npyy-24k06 บ้านหนองพญายอ บางกระทุ่ม	16.56254000	100.38764000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2291	plk-wpd-24k01 บ้านวังประดู่ วังทอง	16.77310100	100.40378000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2292	plk-ntb-24k02 บ้านหนองตะแบก	16.74054100	100.43209000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2293	plk-bdt-24k03 บ้านดงตาล วังทอง	16.68271000	100.46840000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2294	plk-bkr-24k01 บ้านคลองแร่ วัดตายม	16.69409000	100.40790000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2295	plk-jrp-24k02 บ้านเจริญผล วัดตายม	16.65377000	100.44142000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2296	plk-stbt-24k03 บ้านสันติบันเทิง วัดตายม	16.53525000	100.46361000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2297	plk-bkf-24k04 บ้านคลองฝาย วัดตายม	16.60194000	100.50400000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2298	plk-bkl-24k05 บ้านคลองลึก วัดตายม	16.62996839	100.50003693	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2299	plk-swnt-24k06 บ้านสุพรรณพนมทอง วัดตายม	16.62948000	100.52906000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2300	plk-pcr-24k07 พันชาลี วัดตายม	16.61896000	100.54126000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2301	plk-mks-24k01 บ้านมะขามสูง พลายชุมพล	16.92769000	100.23332000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2302	plk-bnh-24k08 บ้านหนองหิน วัดตายม	16.61178000	100.56621000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2303	plk-bpy-24k04 บ้านไผ่ใหญ่ วังทอง	16.75662000	100.56403000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2348	TOT-005_บ้านโป่งแคว	17.34357270	100.37799652	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2304	plk-srsn-24k05 ค่ายสฤษธิ์เสนา วังทอง	16.84262000	100.54468000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2305	plk-bsb-24k06 บ้านซำบอน วังทอง	16.82577000	100.49582000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2306	plk-nmk-24k07 บ้านเนินมะเกลีอ วังทอง	16.68900000	100.53173000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2307	plk-tmr-24k08 ท่าหมื่นราม วังทอง	16.70425330	100.51337124	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2308	plk-btn-24k09 บ้านทุ่งน้อย วังทอง	16.71735000	100.46621000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2309	plk-bwy-24k01 บ้านวังยาง หนองขมิ้น	16.46098000	100.72440000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2310	plk-kod-24k02 บ้านเขาดิน หนองขมิ้น	16.46353000	100.67959000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2311	plk-pcp-24k02 บ้านปากโทก พลายชุมพล	16.88781000	100.24225000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2312	plk-nkn-24k03 บ้านหนองขมิ้น	16.45378000	100.64510000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2313	plk-kpn-24k04 บ้านคลองปากน้ำ เนินมะปราง	16.51210000	100.63910000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2314	plk-noi-24k05_บ้านน้อย	16.52455392	100.59780701	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2315	plk-nckl-24k06 บ้านน้อยซุ้มขี้ เนินมะปราง	16.55197000	100.60790000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2316	plk-msmk-24k07 บ้านใหม่สามัคคี เนินมะปราง	16.53637000	100.70780000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2317	plk-bnk-24k08 บ้านหนองขอน เนินมะปราง	16.53761000	100.64931000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2978	lpg_police school	18.31164933	99.38940422	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2318	plk-dng-24k09 บ้านดงงุ เนินมะปราง	16.59961000	100.64943000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2319	plk-bcp-24k10 บ้านชมพู เนินมะปราง	16.67709000	100.61185000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2320	plk-nip-24k11 บ้านหนองอีป๋อง เนินมะปราง	16.63752001	100.61734039	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2321	plk-pcp-24k03 บ้านสระโคล่ พลายชุมพล	16.88528000	100.28452000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2322	plk-bsy-24k04 บ้านไทรย้อย หนองขมิ้น	16.41651000	100.60948000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2323	บ้านหนองปอ	16.42218492	100.64436564	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2324	plk-bwp-24k06 บ้านวังโพรง หนองขมิ้น	16.41329000	100.67602000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2325	plk-bwk-24k07 บ้านวังขวํญ หนองขมิ้น	16.36293000	100.65604000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2326	plk-spw-24k01 บ้านทรัพย์ไพรวัลย์ บ้านแยง	16.88029000	100.66118000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2327	plk-poy-24k02 บ้านปอย บ้านแยง	16.85682000	100.73854000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2328	plk-kss-24k03 บ้านเกษตรสุข บ้านแยง	16.90564000	100.76204000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2329	plk-bhh-24k04 บ้านห้วยเฮี้ย บ้านแยง	16.92780000	100.89490000	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2330	plk-sru-24k05 บ้านซำรู้	16.93877856	100.82004609	DE	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2331	USO_657_บ้านหนองห้าง	17.06363847	100.03960847	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2332	USO_661_บ้านป่าขนุน	17.05659881	100.50316742	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2333	USO_669_บ้านหนองน้ำปอ	17.18549513	100.68112544	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2334	USO_678_บ้านหนองลวก	17.22294566	100.36779201	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2335	USO-679_ บ้านสวนเมี่ยง	17.22209236	100.50946712	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2336	USO-682_บ้านนาตาจูม	17.30352047	100.45661219	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2337	USO_684_บ้านโคกใหญ่	17.16525196	100.56831244	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2338	USO-686_ บ้านดง	17.37900823	100.49199956	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2339	USO_687_ขุนน้ำคับ	17.39288961	100.70420199	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2340	USO-681_ บ้านน้ำโจน	17.17838797	100.45929780	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2341	USO_605_บ้านหนองนา	16.63908680	99.99356377	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2342	USO_644_บ้านร่มเกล้า	17.59407962	100.90911244	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2343	USO_649_บ้านนาตอน	17.38738257	100.75693999	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2344	USO_663_บ้านบ่อภาค	17.53436844	100.83330144	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2345	USO_683_เทอดชาติ	17.63163098	100.89503381	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2346	TOT-003_บ้านใหม่ชัยมงคล	17.05430053	100.57202092	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2349	TOT-006_บ้านหลังเขา	17.01115796	100.66853832	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2350	USO_ภูหินร่องกล้า	17.00370028	100.99398176	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2351	TOT-008-ปรือกระเทียม	16.68685259	100.00125454	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2352	USO_612_บ้านซำต้อง	16.74330708	100.62331299	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2353	TOT-009_บ้านยาง	17.06690706	100.39243043	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2354	USO_627_บ้านน้ำยาง	16.97079094	100.59957099	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2355	USO-629_บ้านเนินสว่าง	16.96613689	100.56735787	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2356	USO_630_บ้านน้ำคบ	16.98566789	100.40577928	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2357	USO_633_บ้านนาพราน	17.01753604	100.56348254	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2358	USO_636_บ้านหนองหิน	16.96236408	100.67880459	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2359	USO_639_บ้านน้ำริน	16.99415820	100.53435200	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2360	NT2_วัดโบสถ์	16.99186465	100.30991851	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2361	NT2_หมู่บ้านปาริสรณ์	16.89804483	100.28376645	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2362	NT2_ดินทอง	16.76746911	100.43454485	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2363	NT2_วิทยาลัยพาณิชยการบึงพระ	16.76758801	100.26397472	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2364	NT2_แม็คโคร (ซอยหมู่บ้านเศรษฐี 3)	16.79160925	100.22708031	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2365	NT2_สามแยกเต็งหนาม	16.85250191	100.26527177	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2366	XGsPON_ริมน้ำ	16.98708000	100.19273400	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2367	plk_nkt_xgpon	17.09466381	100.83082788	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2368	XGsPON_ม.นเรศวร	16.74450575	100.19907447	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2369	NT2_ปลักแรด	16.68023405	100.09818730	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2370	บ้านเนินเพิ่ม	17.11551081	100.87278124	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2371	NT2_หมู่บ้านโสภณ(หน้า มินิบิ๊กซี)	16.86770368	100.28071251	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2372	NT2_ทรัพย์ไพรวัลย์	16.89289540	100.65245146	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2373	NT2_สี่แยกอินโดจีน	16.81748752	100.32896117	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2374	NT2_ค่ายสมเด็จพระนเรศวรมหาราช	16.82894636	100.25551722	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2375	NT2_บ้านแขก	16.74956766	100.20961780	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2376	NT2_บ้านยาง	16.77465105	100.19898176	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2377	NT2_ท่าทอง หมู่ 3 (วงษ์พาณิชย์-วัดจุฬามณี)	16.77650000	100.21662000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2378	วัดตายม	16.60756876	100.45010709	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2379	NT2_หมู่บ้านพิษณุโลกเมืองใหม่	16.84090509	100.23569527	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2380	NT2_ดงประคำ	17.14962867	100.21744432	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2381	ศรีภิรมย์	17.16418653	100.09917636	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2382	บ้านมะต้อง	17.09133812	100.14723810	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2383	NT2_บางระกำ_CAB#1(lotus)	16.75704466	100.11781695	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2384	NT2_บ้านคลอง Cab#058 (พัน.สร.)	16.83257065	100.24622488	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2385	NT2_หมู่บ้านชินลาภ	16.81653957	100.31925711	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2386	NT2_ราชภัฏพิบูลสงคราม(ทะเลแก้ว)	16.82517485	100.21232452	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2387	มิตรภาพ	16.81818562	100.29448289	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2388	NT2_หมู่บ้านวนาเลคโฮม	16.81501612	100.23651843	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2389	NT2_ชัยนาม	16.83827417	100.46262703	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2390	NT2_ประปาส่วนภูมิภาค(วังทอง-CAB#1)	16.83936369	100.39304841	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2391	บ้านหนองกระท้าว	17.06879541	100.80845241	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2392	NT2_บ้านกร่าง(PTT ช่างพินิจ)	16.86915176	100.21058388	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2393	NT2_ตชด.31(ค่ายเจ้าพระยาจักรี)	16.78120000	100.22101000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2394	NT2_บ้านท่างาม(วัดโบสถ์)	16.99619504	100.32695809	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2396	NT2_ริมน้ำ_Cab#8 (ปากซอยบึงพระจันทร์)	16.79875888	100.24534338	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2397	NT2_โคกมะตูม CAB#51 (หน้า 7-11)	16.79108631	100.26451395	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2398	NT2_สองแคววิลล่า	16.81759034	100.29650157	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2399	NT2_ธรรมบูชา ซอย 1 (ก่อนถึงแยกซอยขุนหาญ-CAB#013)	16.83626655	100.26656588	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2400	NT2_แยกแสงดาว (หมู่บ้านคุ้มเพชรวรินทร์)	16.86499172	100.25681130	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2401	NT2_บ้านดอนทอง(บ้านป่า)	16.91447448	100.35771047	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2402	NT2_บ้านเอื้ออาทรบึงพระ	16.75761399	100.26972625	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2403	NT2_บ้านประโดก	16.83561000	100.33773300	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2404	NT2_ศาลเยาวชนพิษณุโลก	16.84513000	100.25841800	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2405	NT2_บ้านกลาง ม.4	16.97380046	100.56104060	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2406	NT2_ค่ายบรมไตรฯ	16.85960000	100.39104000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2407	NT2_บ้านเสือลากหาง	16.83998636	100.37356549	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2408	NT2_ค่ายเอกาทศรถ(บชร.3)	16.80300000	100.27866000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2409	NT2_พระองค์ขาว ซอย 5 (หลัง ส.สนุกเกอร์)	16.82266714	100.27602928	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2410	NT2_หมู่บ้านหรรษนันท์ ๕	16.82153877	100.24030547	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2411	NT2_เต็งหนาม (ซอยดีอ่ำ)	16.85694023	100.27152411	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2412	NT2_บ้านหัวรอ ม.3	16.85537884	100.25397834	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2413	์NT2_วัดอรัญญิก CAB#16 (สามแยก 7-11)	16.82584966	100.27267078	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2414	NT2_อบจ. พิษณุโลก	16.81958649	100.34425093	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2415	NT2_ศูนย์วิจัยข้าว	16.83740000	100.37554000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2416	NT2_นครไทย CAB#005	17.10868191	100.82719011	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2417	บ้านท่าสะแก	17.25442748	100.62259449	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2418	NT2_บ้านแยง	16.89020000	100.79937000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2419	NT2_แม่ระกา(วัดบ้านเข็ก)	16.71968386	100.36694579	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2420	NT2_บ้านสนามคลี	16.55019315	100.24995409	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2421	NT2_หมู่บ้านสุวรรณวิลล่า	16.82953917	100.25237252	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2422	NT2 _มะขามสูง	16.93717927	100.22929342	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2423	NT2_หนองพระ	16.67671660	100.43662727	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2424	NT2_รพ.วังทอง	16.83574700	100.43720560	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2425	NT2_วัดน้อย	16.83503582	100.26548419	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2426	NT2_ตลาดบ้านคลอง CAB#59	16.82955427	100.25056945	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2427	NT2_ต้นหว้า	16.80170000	100.21437000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2428	NT2_สุรสีห์	16.81076252	100.26014489	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2429	เขื่อนขันธ์	16.81506103	100.28038688	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2430	NT2_บ้านน้ำริน	16.99354074	100.53431739	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2431	บางระกำ 2_xgpon	16.74434632	100.11229528	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2432	XGsPON_โคกมะตูม	16.81222999	100.27393024	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2433	NT2_ทับยายเชียง	17.12568938	100.29637597	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2434	บ้านน้อย (หินลาด-วัดโบสถ์)	17.13104990	100.35357498	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2435	NT2_วังทอง	16.82549441	100.42840576	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2436	NT2_บ้านสวนเมี่ยง	17.22222616	100.50966582	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2437	ศาลาเสือแพร	16.77819624	100.19792116	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2438	XGsPON_บางกระทุ่ม	16.57472992	100.30029683	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2439	XGsPON_บ้านใหม่	16.68686290	100.27164432	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2440	XGsPON_พลายชุมพล	16.85966002	100.21506242	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2441	XGsPON_เนินมะปราง	16.57028648	100.63435338	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2442	NT2_บ้านมุง	16.56033386	100.69050720	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2443	์NT2_หมู่บ้านศุภาลัย (ซอย @tree condo)	16.79665000	100.25446000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2444	จอมทอง	16.89300000	100.21430000	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2445	plk--nongna C620 หนองนา(new)	16.63929297	99.99377813	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2446	NT2_วังเป็ด	16.70707000	100.17191600	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2447	plk--บ้านวังยาง 1 (C620ห้วยบ่อทอง)	16.48122000	100.71102500	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2448	NT2_บ้านวังวน	17.07064559	100.07221108	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2449	NT2_บ้านดง	17.37962420	100.48813564	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2450	NT2_วัดสะกัดน้ำมัน (C620)	16.75515550	100.21902994	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2451	NT2_บ้านหนองกุลา	16.65714700	99.94310000	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2452	NT2_ม.นเรศวร_C300	16.74431515	100.19902977	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2453	NT2_คุยมะตูม	16.71419567	100.03139872	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2454	NT2_บ้านย่านขาด	17.04023033	100.16254010	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2455	บ้านคลองตาล	17.03826458	100.13764192	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2456	NT2_บ้านตลุกเทียม	17.14400752	100.09664012	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2457	NT2_บ้านท่าช้าง	16.98705538	100.19254471	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2458	XGPON_พรหมพิราม	17.03222393	100.20223411	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2459	XGsPON_วงฆ้อง	17.10005355	100.17013729	NT2	พิษณุโลก	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2460	 HW-XGPON-มะตูม	16.93141700	100.20270082	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2461	์NT2_เนินกุ่ม	16.54722176	100.42127940	NT2	พิษณุโลก	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2462	NT2_บ้านคลองมะเกลือ	17.11566000	100.16090200	NT2	พิษณุโลก	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2463	หนองรัก	15.63297000	99.67267300	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2464	NT1_บ้านคลองข่อย	15.59918000	99.58742500	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2465	NT1_ประดาหัก	15.41258246	99.69225071	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2466	NT1_หนองฉาง	15.38436000	99.84663400	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2467	NT1_หนองขาหย่าง	15.36474000	99.91865000	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2468	ทัพทัน	15.45004557	99.88385563	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2469	โคกหม้อ	15.53302030	99.88564920	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2470	ทัพหมัน	15.01678360	99.62152010	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2471	NT1_บ้านทัพคล้าย	15.04994000	99.58820100	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2472	NT1_หนองจอก	15.08404000	99.71635300	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2473	บ้านไร่	15.08144700	99.51986600	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2474	NT1_เขาตะพาบ	15.31326000	99.71432000	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2475	NT1_ไก่ดิ้น	15.20856000	99.60663300	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2476	ห้วยคต	15.29772300	99.62008500	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2477	บ้านคลองหวาย	15.25511400	99.53021800	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2478	ทุ่งนางาม	15.39060700	99.57409300	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2479	ตลุกดู่	15.43753500	99.77371700	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2480	NT1_หนองกระทุ่ม	15.49367000	99.80426000	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2481	NT1_Boadwan เขาผาลาด	15.57310000	99.75039700	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2482	NT1_ลานสัก	15.46097600	99.54961160	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2483	ลานสัก	15.45172000	99.57708000	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2484	ประดู่ยืน	15.43751800	99.61236400	NT1	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2485	บึงแห้ง	15.48896800	99.65568100	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2486	ห้วยขาแข้ง	15.59712000	99.41698800	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2487	NT1_บ้านร่องตาที	15.55847000	99.51316700	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2488	สว่างอารมณ์	15.58513200	99.86443400	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2489	บ้านทุ่งสงบ	15.61484000	99.79105700	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2490	การุ้ง	15.18557300	99.69302300	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2491	บ้านน้ำพุ	15.24867400	99.46802200	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2492	NT1_เจ้าวัด	15.17404000	99.51100900	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2493	NT1_บ้านหนองเต่า	15.46339000	99.96229900	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2494	NT1_น้ำซึม	15.37920000	100.02092000	NT1	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2495	ศูนย์ราชการ	15.35899800	100.00774700	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2496	เนินแจง	15.46538600	100.02187400	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2497	หาดทะนง	15.41816100	100.08989100	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2498	ปากกะบาด	15.37026300	100.04100600	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2499	วัดท่าซุง	15.34198900	100.06553900	NT1	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2500	uti-dokw-24k01 แขวงการทาง	15.40094462	100.02085460	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2501	uti-tgnt-24k01 ทุ่งนาไทย	15.43612222	99.93035119	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2502	uti-ttn-24k01 ทัพทัน	15.45027574	99.88389308	DE	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2503	uti-ngyp-24k01 บ้านดอนหวาย	15.48472431	99.90442117	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2504	uti-ngyd-24k01 หนองยายดา	15.51268940	99.86842029	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2505	uti-swa-24k01 สว่างอารมณ์	15.58624685	99.86741935	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2506	uti-tgsg-24k01 ทุ่งสงบ	15.60785162	99.79932158	DE	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2507	uti-ngkd-24k01 ตลุกหมู	15.44996200	99.83843100	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2508	uti-kokt-24k01 บ้านท่าชะอม ม.6	15.42567006	99.72857161	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2509	uti-nglg-24k01 หนองหลวง	15.63110329	99.87015324	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2510	uti-boyg-24k01 ดอนหวาย ม.7	15.58837173	99.82011758	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2511	uti-swa-24k02 วัดดงแขวน	15.52756577	99.83095964	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2512	uti-tkdo-24k01 บ้านสวนขวัญ	15.51276772	99.68780637	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2930	lpg_lhn_FTTx01	18.21139154	99.33943045	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2513	uti-pikw-24k01 ทุ่งยาว	15.63558022	99.70022603	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2514	uti-pikw-24k02 วังเกษตร	15.61777927	99.63065330	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2515	uti-pikw-24k03 บ่อยาง	15.59519465	99.67291338	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2516	uti-ngkt-24k02 คอดยาง	15.52738886	99.75270324	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2517	uti-pgsn-24k01 พลวงสองนาง	15.55598107	99.79273445	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2518	uti-pikw-24k04 หนองเข้	15.64228809	99.73895604	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2519	uti-pikw-24k05 เขาพระ	15.60099905	99.74922595	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2520	uti-dnky-24k01 ดอนกลอย	15.39325610	99.92129711	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2521	uti-dgkg-24k01 ดงขวาง	15.31397332	99.92477931	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2522	uti-nch-24k01 หนองฉาง	15.39169136	99.83950297	DE	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2523	uti-ngnn-24k01 ห้วยไผ่ขุย	15.33566054	99.86613299	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2524	uti-lmko-24k01 หลุมเข้า	15.33999880	100.03449000	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2525	uti-lmko-24k02 หนองกาหลง	15.31607967	99.98345478	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2526	uti-bnka-24k01 บ้านเก่า	15.39860455	99.88030971	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2527	uti-ngyg-24k01 หนองยาง	15.33520066	99.82376458	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2528	uti-bnka-24k02 โคกมะลิ	15.42878089	99.86917074	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2529	uti-nch-24k02 หนองแบน	15.37345894	99.87041680	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2530	uti-tgpo-24k01 หินไก่เขี่ย	15.38419578	99.78687797	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2531	uti-ngyg-24k02 โรงสีใหม่	15.33247798	99.74795366	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2532	uti-tgpo-24k02 บ้านดงฝิ่น	15.34487206	99.71679695	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2533	uti-kokt-24k02 เขากวางทอง(หนองฉาง)	15.36903333	99.67978385	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2534	uti-kokt-24k03_ประดาหัก	15.41212890	99.69216062	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2535	uti-tgpo-24k03 เกาะตาซ้ง	15.37445082	99.76812326	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2536	uti-mkr-24k01 เมืองการุ้ง	15.17779524	99.69773591	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2537	uti-mkr-24k02 หนองฝาง	15.15892607	99.68977534	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2538	uti-utik-24k01 หนองเต่า	15.39785308	99.80270239	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2539	uti-kokt-24k04 ทุ่งสบาย	15.38650813	99.73944919	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2540	uti-kabk-24k01 โปร่งข่อย	15.34929330	99.57651654	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2541	uti-kabk-24k02 ป่าเลา	15.32398248	99.63312140	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2542	uti-tplg-24k01 ทัพหลวง	15.08792665	99.56758644	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2543	uti-rabm-24k01 ห้วยขาแข้ง	15.55925555	99.46002886	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2544	uti-rabm-24k02 อ่างห้วยดง	15.50421750	99.45840288	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2545	uti-rabm-24k03 ปางไม้ไผ่	15.51569920	99.50195321	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2546	uti-pady-24k01 ประดู่ยืน	15.43954951	99.60767985	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2547	uti-rabm-24k04 ท่ามะนาว	15.47416040	99.49972249	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2548	uti-las-24k01 ปากเหมือง	15.47011522	99.52996625	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2549	uti-nmrb-24k01 คลองข่อย	15.59957500	99.58401142	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2550	uti-nmrb-24k02 น้ำรอบ	15.57942915	99.58295493	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2551	uti-nmrb-24k03 โกรกลึก	15.53693063	99.59164730	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2552	uti-nmrb-24k04 บุ่งกระเซอร์	15.49144871	99.59160894	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2553	uti-pady-24k02 ทุ่งสามแท่ง	15.45880212	99.65391117	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2554	uti-rabm-24k05 คีรีวงศ์	15.44206628	99.47014109	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2555	uti-bar-24k01 บ่อน้อย	15.07677627	99.52068428	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2556	uti-bar-24k02 พุบอน	15.07038516	99.47976887	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2557	uti-้hucg-24k01 บ้านไหม่หนองแก	14.97071273	99.59410594	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2558	uti-bnbg-24k01 ห้วยบง	15.01674263	99.54736655	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2559	uti-bar-24k03 หนองปรือ	15.10232996	99.48316594	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2560	uti-tglg-24k01 คลองหวาย	15.22702380	99.50815903	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2561	uti-kkki-24k01 ทองหลาง	15.20092905	99.47204971	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2562	uti-huhg-24k01 ห้วยพลู	15.18195280	99.58331054	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2563	uti-paoo-24k01 ซับป่าพลู	15.41682309	99.50813256	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2564	uti-paoo-24k02 ป่าอ้อ	15.40459754	99.53427907	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2565	uti-pady-24k03 ดินแดง	15.41488843	99.65394736	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2566	uti-khtp-24k01 เกาะเทโพ	15.37695714	100.07230940	DE	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2567	BR_หนองจิกยาว_เขาปัฐวี	15.44781000	99.77021200	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2979	NT1_ทากาศ	18.42477000	98.98887600	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3171	 โครูบา	18.57673400	99.00386200	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2568	BR_บ้านใหม่คลองเคียน	15.21793912	99.69006206	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2569	BR_รพสต.ล่องตาที	15.55111988	99.50813111	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2570	BR_บ้านหน้าฝายบึงตาโพ	15.07408242	99.54052692	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2571	BR_หูช้าง	15.13128984	99.64733732	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2572	BR_ใหม่โพธิ์งาม	15.08370000	99.71707000	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2573	BR_สะแกกรัง	15.40945144	100.05338976	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2574	BR_เนินเหล็ก-โพธิ์ส้ม	15.47133745	99.98148597	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2575	BR_ห้วยคต_หนองจอก	15.26467320	99.58530000	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2576	BR_บ้านหนองลัน ม.4_สุขฤทัย	15.26889824	99.62716596	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2577	uti-ngch-USO482	15.07561748	99.75893181	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2578	USO_483_BAR	15.11147821	99.39025243	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2579	USO_737_BAR	15.15675188	99.29346403	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2580	หนองขาหย่าง_Huawei	15.36333000	99.93133000	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2581	NTหนองบ่มกล้วย	15.07576300	99.75873800	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2582	NTหมอธิวา	15.37835000	100.02100000	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2583	หลุมเข้า ดงยางใต้ 2563	15.31177606	100.02947940	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2584	 หนองสระ ม.7 2563	15.45135379	99.81449626	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2585	ห้วยแห้ง 2563	15.12249327	99.52879388	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2586	NBN_เนินตูม	15.39683614	100.02992762	NT2	อุทัยธานี	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2587	uti_tapo_โทรศัทพ์(ท่าโพ)	15.36483789	99.98565262	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2588	แยกพระชนก	15.38488375	100.01816484	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2589	ศูนย์ราชการFTTx	15.35877318	100.00828596	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2590	YBKS	15.38700335	100.02351400	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2591	เทคนิคอุทัยธานี	15.36299330	100.04761080	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2592	NBN_ท่าซุงFTTx	15.31947937	100.06616339	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2593	มาบุญชู_CAB7	15.38540649	99.84547087	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2594	ขนส่งบ้านไร่	15.07700836	99.51004656	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2595	บ้านไร่ (อุทัยธานี)	15.08407690	99.52221029	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2596	REPLACE สว่างอารมณ์	15.58600746	99.85880929	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2597	NBN_บ้านหนองแก	15.41951891	99.97033450	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2598	"uti_khmo_ โคกหม้อ"	15.53646800	99.90501100	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2599	NBN_ตลาดลานสัก	15.46562000	99.54236900	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2600	 ทุ่งนา	15.30965347	99.72208238	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2601	เจ้าวัด uti_cwm1_01	15.17567100	99.50502500	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2602	หนองเต่า	15.46629384	99.96464061	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2603	การุ้ง	15.23546838	99.68312128	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2604	ห้วยคต	100.00000000	15.00000000	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2605	 ป่าบัว	15.02238400	99.60261900	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2606	หนองจอก	15.08245157	99.71627102	NT2	อุทัยธานี	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2607	อุทัยธานี C600	15.37855888	100.03062280	NT2	อุทัยธานี	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2608	NT1_นาแหลม	18.15120226	100.15752390	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2609	NT1_สูงเม่น	18.04601177	100.11318820	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2610	NT1_แม่ถาง	18.23241788	100.29631848	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2611	NT1_นาจักร	18.10212162	100.18704842	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2612	NT1_สค.แพร่2	18.17519000	100.17626800	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2613	NT1_วังชิ้น	17.89550043	99.60043847	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2614	NT1_บ่อแก้ว(ดงย่าเฒ่า)	17.91830666	99.90487002	NT1	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2615	NT1_เด่นชัย	17.98385138	100.06011899	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2616	NT1_นาปลากั้ง	17.79317308	99.78441108	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2617	NT1_ลอง	18.08474875	99.84108734	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2618	NT1_หนองม่วงไข่	18.26588829	100.19102428	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2619	NT1_แม่ยางกาด	18.29484005	100.24754587	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2620	NT1_ร้องกวาง	18.32816815	100.30924655	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2621	NT1_ไผ่โทน	18.38357000	100.43216000	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2622	NT1_สอง	18.46798104	100.16946587	NT1	แพร่	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2623	pre-bsk-24k01(สวนเขื่อน)	18.13104919	100.21742467	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2624	USO_3K_นาหลวง	18.74723655	100.30709624	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2625	USO_3K_ปากห้วยอ้อย	18.14716445	100.14654874	DE	แพร่	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2626	pre-btnt-24k01(ตำหนักธรรม)	18.26843476	100.23713936	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2627	pre-hn13-24k01(หัวเมือง ม.13)	18.30586864	100.17574281	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2628	pre-hmi-24k01(ห้วยหม้าย)	18.40828981	100.15442641	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2629	pre-bry-24k01(ร่องเย็น)	18.39307893	100.17455700	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2630	pre-soa9-24k01(สะเอียบ ม.9)	18.73556839	100.23705921	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2631	pre-blp-24k01(บ้านลากปืน)	17.89280000	100.04822200	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2632	pre-bpkp-24k01(ปากปาน ม.1)	17.98674958	99.99845351	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2633	pre-ppw2-24k01(ปงป่าหวาย ม.2)	18.00997074	100.03387262	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2634	pre-sy12-24k01(ไทรย้อย ม.12)	17.96585164	99.98962712	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2635	pre-bp-24k02(บ้านปิน)	18.09964171	99.85832369	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2636	pre-mep3-24k01(แม่ปาน ม.3)	18.00994497	99.84905262	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2637	pre-mjf-24k01(แม่จองไฟ)	18.13432978	99.80566435	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2638	pre-wtk-24k01(วังต้นเกลือ)	18.04906495	99.81191718	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2639	pre-bac-24k01(ทุ่งแล้ง)	17.99200421	99.76982183	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2640	pre-bpj-24k01(ผาจั๊บ)	17.94116639	99.69828665	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2641	pre-mem-24k01(แม่รัง)	17.99570275	99.68585139	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2642	pre-mk-24k01(แม่เกิ๋ง)	17.95031955	99.60601479	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2643	pre-bkpj-24k01(ค้างปินใจ)	17.87701958	99.53533337	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2644	pre-sri1-24k01(สรอย ม.1)	17.74967701	99.42702848	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2645	pre-sri9-24k01(สรอย ม.9)	17.78080875	99.46286288	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2646	pre-bhr-24k01(หาดรั่ว)	17.79095335	99.67508467	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2647	pre-bpm-24k01(ป่าม่วง)	17.82793867	99.55911310	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2648	pre-psk8-24k01(ป่าสัก ม.8)	17.80296077	99.49749026	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2649	pre-bph-24k01(บ้านปากห้วย)	18.17988534	100.13308550	DE	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2650	pre-pay-24k01(ปางยาว)	18.37337326	100.41646962	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2651	pre-myh1-24k01(แม่ยางฮ่อ ม.1)	18.33364669	100.27367624	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2652	pre-hk-24k01(ห้วยแกต)	18.39370537	100.45985199	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2653	pre-myt-24k01(แม่ยางตาล)	18.29257011	100.24825620	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2654	pre-myto-24k01(แม่ยางโทน)	18.30052195	100.28338248	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2655	pre-pre-bigrock-01(แม่สิน)	17.80133323	99.85158380	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2656	BIG ROCK_บ้านนาเวียง	17.90101734	99.60403290	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2657	pre-pre-bigrock-02(นาปลากั้ง)	17.79275479	99.78122716	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2658	BIG ROCK_บ้านแม่หลู้	18.03577437	99.90374452	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2659	BIG ROCK_บ้านนาไร่เดียว	18.53855497	100.19232330	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2660	pre-bwt-24k01(เวียงตั้ง)	18.20244150	100.14049451	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2661	BIG ROCK_บ้านลูนิเกต	18.43849000	100.16560513	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2662	pre-wh-24k01(วังหงษ์)	18.24017998	100.17171041	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2663	pre-mal-24k01(แม่หล่าย)	18.20330005	100.19529823	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2664	pre-hm-24k01(ห้วยม้า)	18.20830911	100.25244833	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2665	pre-mym1-24k01(แม่ยมหมู่ 1)	18.20927225	100.17413144	DE	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2666	NT2_หนองม่วงไข่	18.26942480	100.20259306	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2667	NT2_ช่อแฮ	18.09706510	100.20186350	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2668	NT2_น้ำเลา	18.25035432	100.30058220	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2669	NT2_ร่องฟอง ม.5	18.16678071	100.17909423	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2670	NT2_เวียงทอง	18.11785606	100.12079808	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2671	NT2_บ้านปง	18.06122344	100.08079290	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2672	NT2_ร่องกาศ ม.3	18.08225105	100.12505324	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2673	NT2_น้ำโค้ง ม.1	18.13405903	100.12381160	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2674	NT2_บ้านเหล่า ม.5	18.12309126	100.16641006	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2675	NT2_ร่องกาศ ม.4	18.10302674	100.13406327	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3091	 นิคม 4	18.58291000	99.06028010	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2676	NT2_กาดน้ำทอง	18.11834633	100.15482657	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2677	NT2_ทุ่งป่าดำ	18.15658000	100.16118900	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2678	NT2_มหาโพธิ์	18.15255251	100.13624986	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2679	NT2_เหมืองหม้อ	18.14751547	100.18150822	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2680	NT2_ต้าผามอก ม.6	18.15880406	99.94275363	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2681	NT2_บวกโป่ง	18.03664234	100.09653536	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2682	NT2_หัวฝาย ม.5	18.03256832	100.11403978	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2683	NT2_แม่จั๊วะ	17.97404039	100.07882482	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2684	NT2_หนองม่วงไข่ TT&T	18.26183196	100.20221487	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2685	NT2_บ่อเหล็กลอง	18.05644613	99.77622516	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2686	NT2_เวียงต้า ม.3	18.26161081	99.99009502	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2687	NT2_ห้วยม้า TT&T	18.21018611	100.24944861	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2688	NT2_ทุ่งน้าว TT&T	18.40763698	100.18434234	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2689	NT2_ร่องกาศ ม.2	18.10391851	100.13480130	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2690	NT2_บ้านเหล่า ม.7	18.06609467	100.14242167	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2691	NT2_บ้านเตาปูน	18.48817503	100.20165905	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2692	NT2_ไทรย้อย ม.2	17.96976620	99.99520350	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2693	NT2_บ้านปิน	18.09920718	99.85791234	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2694	NT2_ท่าข้าม	18.21536206	100.15764768	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2695	NT2_วังหลวง	18.29056999	100.16620852	NT2	แพร่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2696	NT2_สูงเม่น	18.05631935	100.11581756	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2697	NT2_เด่นชัย	17.98444456	100.05797908	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2698	NT2_ลอง	18.07737548	99.83217482	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2699	NT2_ร้องกวาง	18.33381900	100.31569109	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2700	NT2_สอง	18.47197725	100.18622237	NT2	แพร่	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2701	MAE LA NOI(FTTX)_NT1_ms-mlas-ol-f554-1	18.38960689	97.94178312	NT1	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2931	lpg_sna_FTTx01	18.06616000	99.24992900	NT2	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2702	NT1_แม่ลาหลวง ms-mlls-ol-f554-1	18.52839000	97.93612000	NT1	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2703	NT1_สถานีทวนสัญญาณดอยกิ่วลม ปางมะผ้า ms-klms-ol-f554-1	19.44269000	98.31843200	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2704	ชุมสายโรงเรียนล่องแพ(FTTX)_NT1	17.64047997	98.09478571	NT1	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2705	NT1_SOB MOEI (FTTx) ms-spms-ol-f554-1	17.96330602	97.92930076	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2706	NT1_HUAI SING(FTTx) ms-bhss-ol-f554-1	18.05846706	97.91748403	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2707	NI1_บ้านแม่เตี๋ย ms-mtas-ol-f554-1	18.29301800	97.91763300	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2708	NT1_บ้านแม่เหาะ ms-mhou-ol-f554-1	18.15389600	98.06909300	NT1	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2709	NT1_MAE SARING(FTTx) ms-msro-ol-f615-1	18.17226784	97.93311354	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2710	NT1_MHS_MAE HONG SON(FTTx)_GPON-FH Office	19.30055111	97.96785570	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2711	NT1_MHS_GPON-FH Mokjampae	19.43980217	97.96453873	NT1	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2712	NT1_MHS_GPON-FH Khunyum	18.82774980	97.93624910	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2713	NT1_PANG MAPHA (FTTx) ms-pmpt-ol-f554-1	19.53126746	98.27040855	NT1	แม่ฮ่องสอน	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2714	NT1_PAI(FTTx) ms-paio-ol-f556-1	19.35628520	98.43742518	NT1	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2715	NT1_บ้านม่วงสร้อย_ms-msyd-ol-f554-1	19.38885800	98.41113030	NT1	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2716	NT!_บ้านใหม่ดอนตัน ms-mdtd-ol-f554-1	19.20828623	98.37327228	NT1	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2717	NT1_WATCHA (FTTx) cm-wjnd-ol-f554-1	19.07285720	98.30398733	NT1	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2718	msn-pmp-24k01	19.54431622	98.21251917	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2719	msn-msn-24k01	19.41618011	97.95557215	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2720	msn-msrr-24k02	18.20289511	97.92942524	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2721	msn-kym-24k02	18.64966256	97.93835785	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2722	msn-mln-24k01	18.48011759	97.90803819	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2723	msn-msrr-24k03	18.15076372	98.13153197	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2724	msn-pai-24k02	19.22351403	98.42325150	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2725	Big_Rock_บ้านห้วยกองก๊าด	17.98851231	97.79046546	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2726	msn-msr-bigrock-01	18.30809000	98.15374000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2727	BigRock_ บ้านคาหาน	19.53772000	98.00288000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2728	Big_Rock_บ้านน้ำกัด	19.50647200	98.07456300	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2729	msn-pai-bigrock-01	19.14429385	98.66966150	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2730	บ้านห้วยผึ่งใหม่	18.61616900	98.09748300	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2731	msn-kym-24k01	18.82807489	98.03652392	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2732	Big_Rock_บ้านห้วยหมูเหนือ	18.04135000	98.13018000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2733	Big_Rock_ บ้านห้วยเดื่อเหนือ	18.28366000	98.08540000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2734	msn-smo-bigrock-02(บ้านเลโค๊ะ)	17.84651000	97.84610000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2735	Big_Rock_บ้านห้วยหมากลาง(เสรีวิทยา)	18.97370000	98.08702000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2736	BigRock_ บ้านแก่นฟ้า	19.06200000	97.91796000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2737	Big_Rock_บ้านดูลาเปอร์(แม่สะแมง)	18.40775528	98.08096389	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2738	msn-pai-bigrock-02	19.17301000	98.56002000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2739	Big_Rock_บ้านแม่เหาะ	18.15372100	98.06926800	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2790	บ้านผาบ่อง	19.20905622	97.98037675	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2740	Big_Rock_บ้านห้วยเฮี๊ยะ	19.50570000	98.49730000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2741	Big_Rock_บ้านแม่แลบ	18.37885709	97.88147405	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2742	Big_Rock_บ้านกองแปเหนือ	18.10397000	98.15370000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2743	msn-pai-bigrock-04	19.12715000	98.57933000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2744	msn-pmp-bigrock-01	19.58048117	98.20579159	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2745	Big_Rock_บ้านดงใหม่	18.34472200	98.11616700	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2746	msn-pmp-bigrock-02	19.64590000	98.09420000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2747	Big_Rock_บ้านละอูบ	18.34697000	98.06059600	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2748	Big_Rock_บ้านแม่สะเรียง	18.20479000	98.01029000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2749	BigRock_บ้านแม่เงา	17.86950014	97.96343587	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2750	Big_Rock_บ้านแม่แจ๊ะ	18.74125000	98.02181000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2751	BigRock_บ้านแม่แพ	18.04094284	98.16587835	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2752	BigRock_ บ้านอุมดาเหนือ	17.99523000	97.99163000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2753	msn-pai-bigrock-05	18.96610000	98.41330000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2754	Big_Rock_บ้านแม่ลาหลวง	18.52828718	97.93502200	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2755	msn-pai-bigrock-06	19.06706587	98.29514980	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2756	BigRock_ บ้านแม่ริดป่าแก่	18.18715717	98.12214502	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2757	Big_Rock_บ้านเมืองปอน	18.73780000	97.92310000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2758	Big_Rock_บ้านแม่สุริน	18.91435500	97.94467700	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2759	BigRock_บ้านป่าแก่กลาง	18.56900000	98.17423000	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2761	บ้านแจ่มน้อย	19.02965000	98.34592640	DE	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2762	msn-msrr-24k01	18.17091200	97.93236700	DE	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2763	msn-pai-24k01	19.32422458	98.43614817	DE	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2764	msn-kym-USO181	18.62836758	97.99867698	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2765	msn-kym-USO182	18.81394500	97.84851300	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2766	msn-kym-USO0044	18.57825200	98.08484100	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2767	USO_0046	17.89929900	97.84495700	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2768	USO_0047	18.68234000	97.99581800	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2769	แกงหอมกะเหรี่ยง	19.20628000	98.19127400	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2771	ปางหมู#2	19.35592476	97.96316654	NT2	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2772	Cap9_ท่าข้าม_แม่สะเรียง	18.18997015	97.93428877	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2773	การประปา#2	19.30474501	97.97066547	NT2	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2775	ปาย (FTTx)	19.36208100	98.43805900	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2776	ขุนยวม	18.82225931	97.93583600	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2777	แม่ลาน้อย	18.38992149	97.94187802	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2778	HUAI SING(FTTx)	18.05603000	97.91751400	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2779	สบเมย	17.96145200	97.93362400	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2780	MOKCHAMPAE MOO1 (FTTx)	19.43365964	97.96582057	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2781	บ้านเสาแดง	18.98000000	98.23310000	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2783	 (บ้านปางเกี๊ยะ หมู่ 11)	18.79380357	98.15055849	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3092	PaSoa	18.64420700	99.04946200	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1	ทรายทองวัฒนา (ทุ่งทราย)	16.30089300	99.82138300	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2	มหาชัย	16.48713100	99.81008500	NT1	กำแพงเพชร	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3	ไทรงาม	16.46944000	99.89263000	NT1	กำแพงเพชร	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2784	บ้านกองสุม	18.39437070	97.62014947	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2785	ZTE_(FTTX)บ้านห้วยหมากหนุน	18.33990000	97.99350000	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2786	 วัดจันทร์	19.07278000	98.30423700	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2787	บ้านแม่หลุยส์	17.72900810	98.02243657	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2788	บ้านในสอย	19.37559920	97.88288073	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2789	บ้านท่าผาปุ้ม	18.30878597	97.90889949	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2791	ไม้ลัน	19.69609941	98.23002484	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2792	MAESARING_CAB#5_	18.15016864	97.92032983	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2793	Maesaring-cab-7	18.15603015	97.94143306	NT2	แม่ฮ่องสอน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2794	บ้านกองก๋อย (Replace)	18.08878001	98.20122487	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2795	บ้านแม่นาเติง	19.39168271	98.42739776	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2796	บ้านนาปาแปก	19.53174338	97.92908192	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2798	ห้วยเขียดแห้ง หมู่5 (เนตชายขอบ ZONE C+)	18.99734649	98.27210815	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2800	 บ้านห้วยโป่ง	19.02923399	97.98268184	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2801	 ตำรวจท่องเที่ยวเก่า	19.35505700	98.43488540	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2802	uso_บ้านห้วยห้อม	18.37677000	98.07712000	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2803	Maelalunag	18.52843808	97.93344553	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2804	Ban_Maung_Pon	18.74331743	97.92807372	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2805	บ้านแม่กิ๊	18.64860000	97.85479000	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2806	NT1_LPG_GPON-FH NGAO NT1	18.76002719	99.97723692	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2807	NT1_LPG_GPON FH HangChat NT1	18.31972519	99.36087540	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2808	NT1_LPG_GPON-FH PaMai NT1	18.29708789	99.50601882	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2809	NT1_LPG_GPON FH NaPor NT1	18.34356978	99.53166922	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2810	NT1_LPG_GPON-FH Rajabhat NT1	18.22663296	99.49113776	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2811	NT1_LPG_GPON-FH ThungKuDai NT1	18.29400335	99.41749604	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2812	NT1_LPG_GPON FH ThungKwian NT1	18.32343338	99.28813900	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2813	NT1_LPG_GPON-FH BanFon NT1	18.24323146	99.44107305	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2814	NT1_LPG_GPON FH MaePung NT1	18.17384103	99.47724234	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2815	NT1_LPG_GPON FH_MaeTa NT1	18.13110139	99.51336174	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2816	NT1_LPG_GPON FH KohKha NT1	18.19628128	99.39185719	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2817	NT1_LPG_GPON-FH NaKaew NT1	18.11276387	99.34407003	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2818	NT1_LPG_GPON-FH SoemNgam NT1	18.05040472	99.23191979	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2819	NT1_LPG_GPON FH_MaeMoh Market NT1	18.27381893	99.66007970	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2820	NT1_LPG_GPON-FH ChaeHom NT1	18.70742259	99.57306343	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2821	NT1_LPG_GPON FH MuangPan NT1	18.76365024	99.50569046	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2782	ศูนย์บริการลูกค้า_NT	19.27865030	97.95747956	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2799	สบป่อง	19.28616353	97.95879012	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2770	FM_Redio_104MHz	19.29017258	97.96459071	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2774	แม่ฮ่องสอน (FTTx)	19.30053213	97.96749896	NT2	แม่ฮ่องสอน	C	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2822	NT1_NTLPG_GPON-FH WangNguen	18.12711000	99.62330609	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2823	NT1_LPG_GPON FH NongKrathing NT1	18.30699503	99.46379367	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2824	NT1_LPG_GPON FH BanAuem NT1	18.40248597	99.42619849	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2825	NT1_LPG_GPON FH BanThungChi NT1	18.53727951	99.47975112	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2826	NT1_lp-spbs-ol-f554-1	17.89035023	99.33630134	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2827	NT1_LPG_GPON-FH Office#2 NT1	18.28352747	99.49003178	NT1	ลำปาง	B	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2828	NT1_lp-mcbs-ol-f554-1	17.36752099	99.14713732	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2829	NT1_lp-thno-ol-f556-1	17.61184546	99.22858540	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2830	NT1_lp-hkns-ol-f554-1	17.52947000	98.99478500	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
899	NT1_พร้าว	19.30000000	99.19710000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
900	NT1_บ่อหิน	18.84600000	99.08050000	NT1	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1058	cmi_mnw_01_แม่นาวาง (Huawei)	19.99969634	99.34375793	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2831	NT1_lp-tmis-ol-f554-1	17.52598939	99.17108911	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2832	NT1_lp-mpks-ol-f554-1	17.44815894	99.12471983	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2833	NT1_lp-mpas-ol-f554-1	17.65483390	99.25042904	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2834	NT1_lp-wmks-ol-f554-1	17.50801223	99.35098777	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2835	NT1_LPG_GPON FH BanPangLa NT1	18.55243046	99.85216706	NT1	ลำปาง	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3423	test3	19.15571341	99.84778337		พะเยา	ทั่วไป	2026-03-09 05:08:14.431905	t	505e312c-181f-48e8-b8d8-5778df42e0b0	{}
2836	NT1_LPG_GPON FH BanHuad NT1	18.67825494	99.93272460	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2837	NT1_LPG_GPON FH BanSaDet NT1	18.39477435	99.62966888	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2838	NT1_lp-cths-ol-b360-1	18.25820796	99.54516354	NT1	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2839	NT1_LPG_GPON FH WangNua NT1	19.14359653	99.61315783	NT1	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2840	lpg-mpn-24k01 เมืองปาน	18.76724127	99.50306761	DE	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2841	lpg-tps-24k01 บ้านทัพป่าเส้า(ชส.วังเหนือ ม.1)	19.19190000	99.62002000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2842	lpg-pah-24k01 บ้านป่าเหียง(ชส.วังเหนือ ม.8)	19.11286254	99.61672258	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2843	lpg-sdk-24k01 บ้านสวนดอกคำ(ชส.วิเชตนคร ม.4)	18.69275000	99.54933000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2844	lpg-pgk-24k01 บ้านปงคอบ(ชส.วิเชตนคร ม.6)	18.74103000	99.57728000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2845	lpg-mwa-24k01 แม่วะ	17.49089691	99.19510822	DE	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2846	lpg-sad-24k01 บ้านสาด(ชส.เกาะคา_บ้านสาด)	18.14375770	99.42416560	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2847	lpg-sal-24k01 บ้านสาแล(ชส.ทุ่งงาม ม.4)	18.07925000	99.21793100	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2848	lpg-sot-24k01 บ้านสบต๋ำ(ชส.นาแก้ว ม.5)	18.09358200	99.34107800	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2849	lpg-smm-24k01 บ้านสวนป่าแม่เมาะ(ชส.บ้านดง ม.7)	18.41932174	99.72688375	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2850	lpg-rpn-24k01 บ้านร้องพัฒนา(ชส.บ้านร้อง ม.10)	18.87551556	99.94697761	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2851	lpg-tup-24k01 บ้านทุ่งผา(ชส.บ้านวอแก้ว)	18.37468200	99.36891300	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2852	lpg-pan-24k01 บ้านปันเหนือ(ชส.ปงเตา ม.13)	18.82055618	99.95050360	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2853	lpg-skp-24k01 บ้านสันกำแพงใต้(ชส.เมืองยาว ม.14)	18.25191897	99.24654273	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2854	lpg-loy-24k01 บ้านเหล่ายาว(ชส.เสริมกลาง ม.6)	18.05137100	99.34116700	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2855	lpg-cez-24k01_แจ้ซ้อน	18.81461206	99.50511517	DE	ลำปาง	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2856	lpg-dot-24k01 บ้านดอนธรรม(ชส.ใหม่พัฒนา ม.8)	18.26296288	99.33878368	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2857	lpg-pom-24k01ปงมะโอ(ชส.งาว_บ้านอ้อน)	18.76050700	99.92544700	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2858	lpg-did-24k01 บ้านดินดำ(ชส.แจ้ซ้อน ม.6)	18.78144363	99.51992163	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2859	lpg-kon-24k01_บ้านขอเหนือ(ชส.บ้านขอ ม.10)	18.66296857	99.47596769	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2860	lpg-mpk-24k01 แม่พริก	17.45003437	99.11259674	DE	ลำปาง	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2861	lpg-pgd-24k01 บ้านปางดะ(ชส.บ้านขอ ม.13)	18.69313296	99.48270572	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2862	lpg-tpr-24k01ทุ่งปงเรียน(ชส.บ้านทุ่งปงเรียน ม.10)	18.46733000	99.45457000	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2863	lpg-dud-24k01 บ้านเด่นอุดม(ชส.ผาปัง ม.3)	17.57039947	99.09582194	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2864	lpg-spo-24k01 บ้านสบเป๊าะ(ชส.แม่ทะ(บ้านน้ำโท้ง))	18.12044111	99.52459252	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2865	lpg-chk-24k01 บ้านแจ้คอน(ชส.ร่องเคาะ ม.12)	18.92268432	99.61045842	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2866	lpg-tuh-24k01 บ้านทุ่งห้า(ชส.วังทรายคำ ม.3)	19.06879197	99.62837495	DE	ลำปาง	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2980	NT1_แม่ทา	18.45819489	99.12769992	NT1	ลำพูน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2981	NT1_ทาป่าสัก	18.54600000	99.24450000	NT1	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2982	NT1_ศูนย์ราชการจังหวัดลำพูน	18.51019000	99.10543900	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2983	NT1_นิคมอุตสาหกรรมออฟฟิศ	18.59100000	99.04160000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2984	NT1_ชุมสายโทรศัพท์ NT2	18.58652000	99.01067100	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2985	NT1_สหพัฒน์	18.54153000	99.02362700	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2986	NT1_อุโมงค์	18.64988834	99.03979905	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2987	NT1_มะเขือแจ้	18.59300000	99.08390000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2988	NT1_บ้านโฮ่ง	18.30100000	98.81020000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2989	NT1_ลี้	17.79292905	98.95267146	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2990	NT1_ป่าซาง	18.51715000	98.93568700	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2991	NT1_ต้นธง	18.55382000	98.97880500	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2992	NT1_บ้านธิ	18.64700000	99.10910000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2993	NT1_เวียงหนองล่อง	18.41200000	98.74860000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2994	NT1_ริมปิง	18.59300000	98.97230000	NT1	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3102	LPN_SoonRachLPN	18.56650180	99.03841770	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2995	lpn-pph2-24k01(บ้านป่าพลู)	18.24394970	98.82889230	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2996	lpn-bawl-24k01(บ้านวังหลวง)	18.19981230	98.84441530	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2997	lpn-bhto-24k01(บ้านห้วยโทก)	18.26512771	98.82323072	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2998	lpn-dohy-24k01(บ้านดงห้วยเย็น)	18.31105930	98.79117530	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2999	lpn-bamt-24k01(บ้านม่วงโตน)	18.34482170	98.79612830	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3000	lpn-bth7-24k01(บ้านช่างเพี้ยน)	18.67161460	99.08090460	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3001	lpn-dowi-24k01(บ้านดอยเวียง)	18.62193930	99.15992920	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3002	lpn-pakt-24k01(บ้านปางกอตัน ม.4)	18.39344380	98.88074800	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3003	lpn-mak4-24k01(บ้านมะกอก)	18.47511681	98.92440224	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3004	lpn-sapu-24k01(บ้านสะปุ๋ง)	18.48962281	98.93912202	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3005	lpn-bam1-24k01Z(บ้านใหม่)	18.45686490	98.88843860	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3006	lpn-maaw-24k01(บ้านแม่อาว)	18.42658280	98.86309370	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3007	lpn-pako-24k01(บ้านปากล้อง ม.9)	18.54236845	98.94077205	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3008	lpn-noyk-24k01(บ้านหนองยางไคล)	18.42850220	99.04257720	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3009	lpn-mopg-24k01(หมูเปิ้ง)	18.45459790	98.95254080	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3010	lpn-dokm-24k01(บ้านดอยคำ)	18.40661590	98.99343470	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3011	lpn-mamy-24k01(บ้านแม่เมย)	18.40003680	98.96296380	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3012	lpn-hgsi-24k01(บ้านห้วยงูสิงห์)	18.08631787	99.03134116	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3013	lpn-tkbp-24k01(บ้านตะเคียนปม)	18.09320560	99.01125790	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3014	lpn-bahh-24k01(บ้านห้วยห้าง)	18.06224040	99.01842440	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3015	lpn-mapd-24k01(บ้านแม่ปันเด็ง)	17.95644308	99.04416451	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3016	lpn-waku-24k01(บ้านวังกู่)	18.47619410	98.82593252	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3017	lpn-lkkw-24k01(บ้านล้องเครือกวาว)	18.41178340	98.79927290	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3018	lpn-btylp-24k01(บ้านทุ่งยาว)	18.49989357	99.07255982	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3019	lpn-jabo-24k01(บ้านจำบอน)	18.52351090	99.08284400	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3020	lpn-nosw-24k01(บ้านหนองซิว)	18.52623220	99.01676460	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3021	lpn-nolm-24k01(บ้านหนองหล่ม)	18.48471580	99.06685267	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3022	lpn-nona-24k01(บ้านหนองหนาม)	18.49596320	98.99205000	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3023	lpn-bhgl-24k01(บ้านโฮ่งลี้)	17.77638180	98.99697290	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3024	lpn-tpsk-24k01(บ้านทาป่าสัก)	18.54501200	99.24405640	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3025	lpn-ttpa-24k01(บ้านทาทุ่งไผ่)	18.52793120	99.23244750	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3026	lpn-ssmn-24k01(บ้านศรีทรายมูล)	18.49016130	99.18419760	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3027	lpn-tss2-24k01(บ้านทาสบเส้า)	18.42402340	99.08727280	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3028	lpn-bklg-24k01(บ้านกอลุง)	18.44390800	99.10773820	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3029	lpn-matt-24k01(ชุมสายแม่ทา)	18.46153810	99.13251790	DE	ลำพูน	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3030	lpn-bnpg-24k01(บ้านปวง)	17.87696910	99.06531940	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3031	lpn-bapu-24k01(บ้านปู)	17.84392834	99.00350205	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3032	lpn-papi-24k01(บ้านป่าไผ่)	17.86358210	98.92746230	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3033	lpn-tkmg-24k01Z(บ้านท่ากอม่วง)	18.34801270	98.69876740	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3034	lpn-npsw-24k01(บ้านหนองปลาสะวาย)	18.33336800	98.70729600	DE	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3035	lpn-sv10-24k01(บ้านศรีวิชัย)	18.03535730	98.88376590	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3036	lpn-sps5-24k01(บ้านสันป่าสัก)	17.95434890	98.90127970	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3037	lpn-bapa-24k01(บ้านปาง)	18.11388140	98.89052340	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3038	lpn-hpc-24k01(ห้วยปู่เจ็ก)	18.13494450	98.87556650	DE	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3039	lpn-bnbk-24k01(บ้านหนองบัวคำ)	17.92523063	98.90834564	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3040	lpn-hubo-24k01(บ้านห้วยบง)	18.07819669	98.89439298	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3041	lpn-bmte-24k01(บ้านแม่เทย)	17.96061000	98.89409000	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3042	lpn-ฺbdym-24k01(บ้านเด่นยางมูล)	17.72731462	98.95571287	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3043	lpn-brn-bigrock-01(บ้านห้วยอ้อ)	18.44929630	98.81961090	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3044	lpn-thc-bigrock-01(ทุ่งหัวช้าง)	18.00245651	99.02814092	DE	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3045	แม่ลาน	17.76624200	98.82206400	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3046	ก้อ	17.63893000	98.78630300	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3047	แม่หว่าง USO	17.68884000	98.98678100	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3048	lpn-lii-TOT014 ป่าคา	17.71650000	99.04842100	NT2	ลำพูน	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3049	แม่ตืน	18.00440000	98.87758000	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3050	หนองหมู	18.46538100	98.87055460	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3051	มะเขือแจ้	18.58952000	99.08094500	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3052	บ้านเรือน	18.51050000	98.87601000	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3053	ป่ารกฟ้า	18.43641200	98.79512900	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3054	บ้านหล่ายแก้ว	18.36635900	98.77453560	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3055	ทุ่งหัวช้าง huawei	18.57931828	99.00785161	NT2	ลำพูน	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3056	 ลำพูน1	18.58662901	99.01036347	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3057	 ป่าซาง	18.51905005	98.93757790	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3058	 บ้านโฮ่ง	18.30029045	98.81367379	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3059	 อุโมงค์	18.64964100	99.03990300	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3060	 บ้านธิ	18.68433000	99.15354000	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3061	 ป่าสัก	18.54245090	99.02986910	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3062	 ลี้	17.80555267	98.95177458	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3063	 ทากาศ	18.42476069	98.99060649	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3064	 เวียงหนองล่อง	18.41865000	98.71537000	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3065	 ร่องส้าว	18.56431600	99.06237100	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3066	 ประตูป่า ม.4	18.62233033	99.00232854	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3067	 ทาชมภู	18.51535694	99.21606665	NT2	ลำพูน	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3068	 จามเทวี	18.58118600	98.99813500	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3069	 สันมะนะ	18.65243380	99.06739770	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3070	 บ้านห้วยไฟ	18.32545140	98.90849610	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3071	 ห้วยยาบ	18.67419940	99.14448870	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3072	เจดีย์ขาว(ริมปิง ม.5)	18.60051260	98.98075960	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3073	 ล่ามช้าง(ประตูป่า ม.3)	18.63878540	99.00207630	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3074	 ปากบ่อง ม.4	18.53343100	98.91715100	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3075	 ศรีบัวบาน	18.52669189	99.08157093	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3076	 เหล่ามะเหยือง	18.36427471	98.76198062	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3077	 บ้านบวก	17.73806000	99.03584300	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3078	 วังผาง ม.4	18.43279100	98.76008100	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3079	 บ้านปวงคำ	17.76571900	98.98647500	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3080	 ป่าตึง ม.6	18.46930800	98.96507870	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3081	ชุมสายบ้านเวียง Replace SPC TT&T	18.41834670	98.74879360	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3082	 ต้นธง	18.56880592	98.99604895	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3083	 ห้วยห้า	18.32446070	98.81731820	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3084	 หนองซิว	18.53707560	99.00206170	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3085	 ดอยแก้ว	18.46290010	99.16256590	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3086	 แม่สารป่าแดด.2	18.56246800	99.03332590	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3087	Kad-Eui-Joom	18.65102170	99.12557070	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3088	 เหมืองกวัก	18.61551700	99.09230560	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3089	LPN_NiKom-2	18.58923710	99.05165580	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3090	 นิคม 3	18.58442100	99.04917110	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3093	LPN_MaeRongNoy	18.63284430	99.05304350	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3094	MhuangNgar MU 2	18.61392042	99.02812605	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3095	 เอื้ออาทรเหมืองง่า	18.58719000	98.99447900	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3096	WangDin	17.80030100	98.95000400	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3097	LPN_ ศาลจังหวัดลำพูน	18.50862310	99.10019930	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3098	Pak_klong_M9	18.54274990	98.94136750	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3099	PaHa (  ป่าห้า )	18.47104320	98.95636870	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3100	BanSanPaSak M6 (สันป่าสัก ม.6 ) ต.ป่าสัก	18.54012300	99.03650230	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3101	 นิวรัชฏแลนด์	18.55120020	99.03465870	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3104	BanPan ( บ้านแป้น )	18.50572920	98.96257430	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3105	LPN_ กองงาม	18.51154980	98.91287180	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3106	HuayToem ( บ้านห้วยต้ม )	17.73168750	98.95487430	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3107	MaeTeoy	17.95374170	98.89813800	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3108	SanPaSak M-5	17.96127310	98.89394720	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3109	LPN_SanKabTong	18.66147170	99.05219190	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3110	 ทาป่าสัก(TOT)	18.54784590	99.24463940	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3111	 Replace SPC ThungHuaChang(ทุ่งหัวช้าง)	18.00192881	99.02642307	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3112	HuaiNamDib (ห้วยน้ำดิบ)	18.29428700	98.83014040	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3113	SanPuLoei (สันปูเลย )	18.38059200	98.74769200	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3114	LaoYao mu6 (เหล่ายาว ม.6 )	18.34705290	98.77736850	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3115	BanHuaiToke (บ้านห้วยโทก )	18.26469980	98.82192180	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3116	ThaKoMuang (บ้านท่ากอม่วง )	18.36052700	98.68985370	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3117	NakornChedi (นครเจดีย์ )	18.43586190	98.87274260	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3118	 Replace SPC TaKhianPom(ตะเคียนปม)	18.09333532	99.01239871	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3119	NamDip ( น้ำดิบ )	18.45611340	98.83282100	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3120	PaSangNoi (ป่าซางน้อย )	18.51877850	98.94304780	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3121	BanSaem (บ้านแซม )	18.47648470	98.93421340	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3122	SanKamPhaeg (บ้านสันกำแพง )	18.47487490	98.91577880	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3123	LongKruaKwaow (ล้องเครือกวาว )	18.41600840	98.79668360	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3124	BanNongDU (บ้านหนองดู่ )	18.52103300	98.89511030	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3125	 บ้านร่องช้าง (ฺ BAN RONG CHANG )	18.47526620	98.88611570	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3126	MaeTongRew (แม่ทองริ้ว )	18.52923250	98.94061940	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3127	BanRaiDong (บ้านไร่ดง )	18.46763490	98.85533690	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3128	BanPaBuk (บ้านป่าบุก )	18.49519700	98.90881800	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3129	BanNongPham (บ้านหนองผำ )	18.59456290	98.97329970	NT2	ลำพูน	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3130	 ลำพูนวิลเลจ	18.55231500	99.03779930	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3131	 บ้านเส้ง (BAN SEANG )	18.51907030	98.96551010	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3132	SanPaHiang ( สันป่าเหียง )	18.62213540	99.09796510	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3133	MaeSanBanThong ( แม่สารบ้านตอง )	18.56905520	99.01641810	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3134	SriBauBan2 (ศรีบัวบาน 2 )	18.52458660	99.08724890	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3135	PaSak_BanThi (ป่าสัก )บ้านธิ	18.65271170	99.12229300	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3136	 กาดอินทร	18.58150000	99.07227340	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3137	PraTuKhong (ประตูโขง )	18.56703440	99.04475050	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3138	Mueang Chi Mu2 ( เหมืองจี้ ม.2 )	18.48267140	98.97373120	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3139	BanPaKhaem (บ้านป่าแขม )	18.64024800	99.00718920	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3140	 เหมืองง่า ม.4	18.59413651	99.02445954	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3141	PraTuLii ( ประตูลี้ )	18.57250760	99.00594350	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3142	NongChangeKuen (บ้านหนองช้างคืน )	18.65290120	99.01728180	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3143	BanNamPhu (บ้านน้ำพุ )	18.50908930	99.02704390	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3144	BanSingKhoeng ( บ้านสิงห์เคิ่ง )	18.57661750	99.04812450	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3145	NongTha ( หนองท่า )	18.51389390	99.00667390	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3146	SaLaeng ( สะแล่ง )	18.57593485	99.09360293	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3147	Makhuea_chae ( มะเขือแจ้ )	18.59464920	99.08219890	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3148	 ฮ่องกอม่วง 2	18.60623000	99.05751670	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3149	SanHuaWua ( สันหัววัว )	18.62003070	98.99205040	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3150	 ฮ่องแล้ง ( BAN HONG LAENG )	18.60394870	98.97135970	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3151	Lamphun_country_Home ( ลำพูนคันทรีโฮม )	18.55733960	98.97227020	NT2	ลำพูน	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3152	Huai_Sai_Klang (ห้วยไซกลาง)	18.69314990	99.15844870	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3153	BanNongBua (บ้านหนองบัว )	18.55106340	99.05022120	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3154	 วัดดอยติ ( WAT DOI TI )	18.54832730	99.05154720	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3155	 บ้านม้า	18.54872500	99.07076850	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3156	ChaiSaThan ( ชัยสถาน )	18.62617760	99.04246090	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3157	Land&House (ลำพูนแลนด์แอนเฮ้าส์ )	18.57217850	98.99472510	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3158	JakKamPiMook ( จักรคำภิมุข )	18.56911320	98.96392400	NT2	ลำพูน	pending	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3159	Umomg Mu8 ( อุโมงค์ ม.8 )	18.64538600	99.05310300	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3160	BanSiYoi ( ศรีย้อย )	18.54891140	98.97533660	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3161	WangHaiMu7 ( วังไฮ ม.7 )	18.55659650	98.99583130	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3162	WiangKaew ( หมู่บ้านเวียงแก้ว 2 )	18.57139780	99.02378250	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3163	Ban_Thi_Goverment_Center (ศูนย์ราชการบ้าธิ )	18.63139100	99.11499350	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3164	BanPaSao (บ้านป่าเส้า )	18.63592480	99.04056800	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3165	MaeSanPakHam M5 ( แม่สารป่าขาม ม .5 )	18.56183230	99.03394440	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3166	BanPaTuengNgam (บ้านป่าตึงงาม )	18.54021510	99.06004060	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3167	BanThungYao ( บ้านทุ่งยาว ) ลำพูน	18.50031400	99.07213820	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3168	Chakkham Khanathon (จักรคำคณาทร )	18.58990730	99.01537550	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3169	MueangNga M10 (เหมืองง่า ม.10 )	18.59565300	99.01548210	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3170	BanLuk (บ้านหลุก )	18.62913770	99.01187790	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3172	WiangYong (เวียงยอง )	18.57670030	99.01738840	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3173	ThaThungLuang (ทาทุ่งหลวง )	18.42604630	99.03063590	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3174	TaKoomNgoeng (ทาขุมเงิน )	18.42769380	98.95813060	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3175	 MaeMoei(แม่เมย)	18.40226550	98.96460000	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3176	ThaThungPai (บ้านทาทุ่งไผ่ )	18.52674300	99.23330570	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3177	ThaLaiSai (ทาหล่ายสาย )	18.45265800	99.11819470	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3178	 ThaPlaDook M6 ( ทาปลาดุก ม.6 )	18.47838720	99.18539660	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3179	 ทาสบเส้า TOT	18.42463100	99.08719540	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3180	PaPhaiLii (ป่าไผ่ ลี้ )	17.86538950	98.92657200	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3181	DongHuaiYen (ดงห้วยเย็น )	18.31223340	98.78995730	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3182	NongBuaKhum (หนองบัวคำ )	17.92592710	98.90818500	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3183	BanPaJee (บ้าน ป่าจี้ )	17.82408100	98.93107500	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3184	PraTadHaDuang (พระธาตห้าดวง )	17.78179250	98.95420160	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3185	 บ้านฮั่ว	17.71053200	98.97738470	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3186	BanMaeWang (บ้านแม่หว่างลุ่ม )	17.68250860	99.00752340	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3187	 ผาลาด ( BAN PHA LAD )	17.70287387	98.95088799	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3188	ThaChang ( ท่าช้าง )	18.39971764	98.73377769	NT2	ลำพูน	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3189	NT1_ศรีนคร2 FBH	17.34935000	99.98426800	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3190	NT1_บ้านตึก FiberHome	17.58968000	99.80969200	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3191	N1_เมืองเก่า ม.4 FBH	17.03076000	99.67422600	NT1	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3192	 N1 ท่าฉนวน FBH	16.82910000	99.88541000	NT1	สุโขทัย	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3193	NT1_บ้านสารจิตร FBH	17.43752395	99.72394090	NT1	สุโขทัย	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3194	NT1_ศรีสัชนาลัย2 FBH	17.51775000	99.76026700	NT1	สุโขทัย	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3195	NT1_กงไกรลาศ FBH	16.95436300	99.97929270	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3196	NT1_คีรีมาศ FBH	16.82877000	99.80909400	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3197	NT1_บ้านด่านลานหอย2 FBH	17.00599000	99.57352000	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3198	NT1_บ้านด่านลานหอย1 FBH	17.01300000	99.58490000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3199	NT1_วังไม้ขอน FBH	17.30302000	99.82463000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3200	NT1_สวรรคโลก2 FBH	17.33175000	99.83965800	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3201	NT1_ท่าชัย FBH	17.40034100	99.81137440	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3202	NT1_คลองยาง FBH	17.34450000	99.90317000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3203	NT1_ศรีนคร FBH	17.35126200	99.98797220	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3204	NT1_เมืองบางยม FBH	17.23360000	99.85797000	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3205	NT1_ทุ่งเสลี่ยม FBH	17.32048000	99.56632700	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3206	NT1_บ้านกล้วย2 FBH	17.01115000	99.77717200	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3207	NT1_บ้านสวน2 FBH	17.04017003	99.88238273	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3208	NT1_รามคำแหง(ปากคลอง) FBH	17.05020800	99.69580940	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3209	NT1_ศรีสำโรง FBH	17.15830000	99.85878800	NT1	สุโขทัย	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3210	NT1_ท่าช้าง FBH	17.07000000	99.83820000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3211	NT1_เมืองสุโขทัย FBH	17.00612000	99.82565200	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3212	NT1_สุโขทัย FBH	17.00737080	99.82352363	NT1	สุโขทัย	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3213	NT1_ศรีสัชนาลัย FBH	17.51630000	99.76533000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3214	NT1_บ้านซ่าน FBH	17.19770000	99.77658000	NT1	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3215	NT1_ซอยลำยวนศรีสำโรง FBH	17.18828000	99.86345400	NT1	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3216	sti-krnk-24k01ไกรนอก	16.98587600	100.01044000	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3217	sti-bkg-24k01ตลาดเทศบาลกง	16.94003396	99.96490614	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3218	sti-dodi-24k02ดงเดือย	16.92512042	100.01029005	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3219	sti-pafk-24k01ป่าแฝก	16.98503200	99.94374600	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3220	sti-krna-24k01ไกรใน	17.01161300	99.96950100	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3221	sti-mko-24k01เมืองเก่า	17.01603600	99.72900800	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3222	sti-bsu-24k01บ้านสวน	17.04013900	99.88214400	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3223	sti-sti-24k01สุโขทัย	17.00717400	99.82347100	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3224	sti-yasa-24k01ยางซ้าย ม.11	16.95016000	99.82974000	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3225	sti-pkpa-24k01ปากพระ	16.91851400	99.85007500	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3226	sti-bdl-24k01 บ้านด่านลานหอย	17.00656643	99.57341057	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3227	sti-bdl-24k02 วังตะคร้อ	16.99604779	99.49498959	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3228	sti-wmkh-24k01วังน้ำขาว ม.2	17.11428260	99.54573668	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3229	sti-walu-24k01วังลึก ม.1	17.04945654	99.49363762	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3230	sti-bnri-24k01 บ้านไร่(บ้านซ่าน)	17.19334000	99.77316600	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3231	sti-tpph-24k01ทับผึ้ง ม.2	17.09606039	99.82216097	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3232	sti-wtda-24k01 (วัดหนองตาโชติ)	17.14634100	99.71514800	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3233	sti-wntn-24k01วังทอง ม.4	17.14191405	99.82382662	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3234	sti-kmt-24k01 บ้านทุ่งยางเมือง(คีรีมาศ)	16.76538485	99.82557186	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3235	sti-nnch-24k01หนองจิก ม.1	16.75707000	99.75726000	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3236	sti-skrm-24k01ศรีคีรีมาศ ม.1	16.84599090	99.74861736	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3237	sti-kmt-24k02 สามพวง ม.3	16.78571023	99.79192665	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3238	sti-bpom-24k01บ้านป้อม ม.3	16.90895183	99.78719984	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3239	sti-tla-24k01ทุ่งเสลี่ยม	17.32262033	99.55985672	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3240	sti-klyn-24k01คลองยาง ม.4	17.33593463	99.90398216	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3241	sti-nnkl-24k01หนองกลับ ม.3	17.24041129	99.77512579	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3242	sti-slk-24k01สวรรคโลก	17.31816509	99.83014265	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3243	sti-ntu-24k01นาทุ่ง	17.30942800	99.76995300	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3244	sti-yaya-24k01ย่านยาว ม.10	17.26040679	99.83639948	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3245	sti-kld5-24k01กลางดง ม.5	17.36838336	99.53867670	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3246	sti-tci-24k01ท่าชัย	17.38384400	99.80025200	DE	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3247	sti-dkhu-24k01ดงคู่ ม.3	17.53244000	99.89949900	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3248	sti-bntc-24k01บ้านนาต้นจั่น	17.62008000	99.82490300	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3249	sti-bhca-24k01บ้านหาดแค	17.68774000	99.71043000	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3250	sti-msn2-24k01แม่สิน ม.2	17.75321776	99.77210312	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3251	sti-nado-24k01นครเดิฐ	17.40611200	99.98436200	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3252	sti-ngb4-24k01หนองบัว ม.4	17.27697000	99.95719000	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3253	sti-thcs-24k01ไทยชนะศึก ม.11	17.33368503	99.60318038	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3254	sti-bmcm-24k01บ้านใหม่ชัยมงคล	17.28878800	99.67405300	DE	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3255	sti-sin-USO691บึงเจริญ	17.46544000	99.99247300	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3256	sti-bdl-USO618ตลิ่งชัน	17.13856000	99.39719500	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3257	sti-ssr-USO662ใหม่สระแก้ว	17.11286000	99.69148100	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3258	sti-ssr-USO673ลุตะแบก	17.16932000	99.71406100	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3259	sti-bdl-USO674หนองเตาปูน	17.07568000	99.48065100	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3260	sti-ssc-USO696สันหีบ	17.63988632	99.58204687	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3261	sti-ssc-USO701ปางสา	17.67539000	99.64729900	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3262	sti-kmt-USO620เขาพร้าน้ำพุ	16.78919000	99.62986400	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3263	sti-bdl-USO642ใหม่คลองอุดม	16.99717000	99.49944600	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3264	sti-bdl-USO667เขาขวาง	17.15529000	99.52227600	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3265	sti-ssr-USO671คลองสะเกษ	17.17510000	99.62351900	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3266	sti-ssr-USO672 ผาแดง	17.12525000	99.60638200	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3267	sti-sin-USO688นิคมพัฒนา	17.41559000	99.90946400	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3268	sti-tla-USO689ห้วยต้นผึ้ง	17.51535000	99.55174100	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3269	sti-ssc-USO690แคทอง	17.47166000	99.64528800	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3270	NT_เมืองเก่าชุมชนนคร3	17.02396700	99.70739710	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3271	NT_วังน้ำขาว ม.2	17.11275000	99.54987730	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3272	NT_ปากแคว (บ้านท่าพระ)	17.04861000	99.82305600	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3273	NT_ราวต้นจันทร์ ม.4	17.16910000	99.71414000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3274	NT_บ้านหลุม	16.99416000	99.87371100	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3275	NT_ทุ่งหลวง	16.87585000	99.79660400	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3276	NT_ศรีสำโรง(คลองตาล)	17.17116700	99.86486730	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3277	NT_วังทอง ม.4	17.14340000	99.82391000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3278	NT_ศรีสำโรง(ประชาอุทิศ)	17.16954900	99.86049500	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3279	NT_สวรรคโลกCAB#012	17.30208400	99.83411550	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3280	NT_สวรรคโลก(วัดสวัสติการาม)	17.31182900	99.82506570	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3281	NT_ศรีสัชนาลัย(บ้านทุ่งพล้อ)	17.54117000	99.78035300	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3282	NT_บ้านใหม่เจริญผล	16.75970000	99.70306000	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3283	NT_ท่าฉนวน(หนองตูม)	16.84530300	99.93362130	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3284	NT_ศรีสัชนาลัย(หาดเสี้ยว)	17.51629100	99.75638590	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3285	NT_กระชงค์	17.01413000	99.84381100	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3286	NT_บ้านกล้วย	17.01032700	99.79073100	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3287	NT_ป่ากุมเกาะ ม.3	17.37441000	99.80244800	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3288	NT_วัดกำแพงงาม	17.01132100	99.78136790	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3289	NT_ศรีสำโรง(วังลึก)	17.15096000	99.87324600	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3290	NT_คีรีมาศ(หนองกระดิ่ง)	16.81296800	99.81300840	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3291	NT_ป่าแฝก ม.6	16.98490000	99.94358000	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3292	NT_วัดทุ่งเสลี่ยม	17.31213200	99.55316120	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3293	NT_คลองยาง ม.4(สวรรคโลก)	17.33590000	99.90504000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3294	NT_บ้านตึก ม.6(ดงย่าปา)	17.66340000	99.88871000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3295	NT_บ้านห้วยไคร้(ดงคู่)	17.55240000	99.87905000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3296	NT_ชุมสายคีรีมาศ	16.82869000	99.80875900	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3297	NT_หนองเรียง	17.22232000	99.77476200	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3298	NT_บ้านแก่ง ม.9	17.43300000	99.68802000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3299	NT_บ้านคลองยางสุโขทัย	16.97790000	99.79159000	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3300	NT_เบญจมาศ	17.32683700	99.83733400	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3301	NT_สวรรคโลก_XgsGpon	17.31801000	99.83042600	NT2	สุโขทัย	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3302	NT_กงไกรลาศ_XgsGpon	16.95240000	99.97559400	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3303	NT_ซอย1มกรา	17.30705400	99.83246490	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3304	NT_ทุ่งเสลี่ยม2	17.32251000	99.56010600	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3305	NT_ท่าทอง2	17.21406000	99.85165000	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3306	NT_ศรีเสวต	17.00351100	99.83121760	NT2	สุโขทัย	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3307	NT_บ้านตึก	17.58504000	99.81972000	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3308	NT_ปากแคว	17.05455900	99.82152990	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3309	NT_บ้านไร่	17.19121000	99.77042500	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3310	NT_บ้านสามหลัง	17.32650000	99.62207000	NT2	สุโขทัย	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3311	NT1_สค.อต.	17.60579678	100.08420127	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3312	NT1_ลับแล	17.65037631	100.04261655	NT1	อุตรดิตถ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3313	NT1_วังสีสูบ	17.66742600	100.14700600	NT1	อุตรดิตถ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3314	NT1_คอนเทนเนอร์ ปณ.อต	17.62346930	100.09996744	NT1	อุตรดิตถ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3315	NT1_ดงช้างดี	17.54501306	100.19125947	NT1	อุตรดิตถ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3316	NT1_ชุมสายอุตรดิตถ์	17.63341448	100.09813817	NT1	อุตรดิตถ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3317	NT1_ทองแสนขัน	17.45864907	100.35019233	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3318	NT1_น้ำพี้	17.55874004	100.28748189	NT1	อุตรดิตถ์	Type D (Small)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3319	NT1_พิชัย	17.28830658	100.09192225	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3320	UTT_GPON FH Payaman NT1	17.18872409	100.05893633	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3321	FH_Tron_1_UTT	17.46097779	100.12543720	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3322	NT1_ท่าปลา	17.78828800	100.37549040	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3323	NT1_ร่วมจิต.	17.70600282	100.34776909	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3324	NT1_เขื่อนสิริกิติ์	17.73513488	100.55937111	NT1	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3325	NT1_น้ำปาด	17.72828387	100.68747273	NT1	อุตรดิตถ์	Type C (District)	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3326	utt-bak-24k03(บ้านห้วยมุ่นหมู่2)	17.80919263	100.93906447	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3327	utt-tsn-24k01(ทองแสนขันหมู่ 2)	17.46009547	100.34709421	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3328	utt-tsn-24k02(วังโป่ง หมู่3)	17.52982652	100.41234577	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3329	utt-tsn-24k03(10 น้ำไคร้หมู่2)	17.58650103	100.49076441	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3330	utt-npa-24k02(ชุมสาย บ้านฝายหมู่4)	17.76975032	100.72559386	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3331	utt-brc-24k03(ผาเลือด หมู่9)	17.72527032	100.39528777	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3332	utt-brc-24k04(ท่าปลา หมู่11)	17.75565913	100.35352768	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3333	utt-utt-24k01(บ้านดงช้างดี หมู่8)	17.55190690	100.17703471	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3334	utt-utt-24k02(น้ำอ่าง หมู่9)	17.47096384	100.23594507	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3335	utt-utt-24k03(บ้านหลวงป่ายาง หมู่2)	17.45381093	100.22513555	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3336	utt-ths-24k01(บ้านท่าสัก หมู่1)	17.40474046	100.09946303	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3337	utt-pch-24k01(บ้านห้วยคา หมู่9)	17.31075579	100.12305866	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3338	utt-pch-24k02(บ้านเสาหิน หมู่7)	17.24476062	100.02774438	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3339	utt-pch-24k03(ท่ามะเฟือง หมู่6)	17.23807672	100.05554488	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3340	utt-pch-24k04(คลองน้ำไหล หมู่9)	17.28568331	100.02398041	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3341	utt-brc-24k01(ร่วมจิต หมู่2)	17.71828495	100.34927580	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3342	utt-ths-24k02(บ้านชำหนึ่ง หมู่5)	17.42829592	100.07054393	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3343	utt-phym-24k01(พญาแมน หมู่3)	17.18525712	100.05937622	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3344	utt-phym-24k02(บ้านคลองเรียงงาม หมู่8)	17.21215217	100.11303785	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3345	utt-utt-24k04(ข่อยสูง หมู่ 8)	17.47584952	99.99363601	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3346	utt-hast-24k01(บ้านวังยาง หมู่ 14)	17.67423449	100.21432938	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3347	utt-hast-24k02(บ้านเหล่าป่าสา หมู่ 1)	17.71807970	100.21086374	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3348	utt-hast-24k03(บ้านคลองนาพง หมู่ 7)	17.64534921	100.25640195	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3349	utt-hast-24k04(บ้านปากสิงห์ หมู่ 6)	17.66811515	100.29883482	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3350	utt-hast-24k05(บ้านคุ้งยางหมู่ 7)	17.65594713	100.28559763	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3351	utt-hast-24k06(แสนตอ หมู่ 2)	17.66260784	100.29735018	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3352	utt-hast-24k07(บ้านหนองหิน หมู่ 6)	17.57141010	100.23830352	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3353	utt-hast-24k08(บ้านวังถ้ำหมู่ 3)	17.59844545	100.34643449	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3354	utt-utt-24k05(บ้านป่าหว่าน หมู่12)	17.79133637	100.11713606	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3355	utt-tha-24k01(จริม หมู่5)	17.82935033	100.36686595	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3356	utt-tha-24k02(หาดล้าหมู่ 7)	17.79361416	100.33884846	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3357	utt-brc-24k02(บ้านท้ายเขื่อนหมู่13)	17.73847917	100.52403768	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3358	utt-tha-24k03(บ้านปางหมิ่นเหนือ หมู่11)	17.82903233	100.29329944	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3359	utt-tha-24k04(บ้านทรายงาม หมู่10)	17.88182982	100.28718401	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3360	utt-fta-24k01(บ้านห้วยน้อยกา หมู่1)	18.10791181	101.03652232	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3361	utt-fta-24k02(บ้านปางไฮหมู่9)	18.18654378	101.06524097	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3362	utt-lle-24k01(บ้านมหาราช หมู่11)	17.70242273	100.01848455	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3363	utt-npa-24k01(ห้วยไคร้ หมู่9)	17.70630693	100.64263288	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3364	utt-bak-24k01(บ้านห้วยครั่ง ม.4)	18.01745831	101.09949946	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3365	utt-bak-24k02(บ้านโป่งพานหมู่5)	17.88782952	100.97645624	DE	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3366	utt-npa-USO693(บ้านห้วยคอม)	17.58148600	100.67811600	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3367	utt-npa-USO695(บ้านต้นขนุน)	17.62766000	100.71868600	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3368	utt-npa-USO698(บ้านห้วยเดื่อ)	17.66256700	100.75826100	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3369	utt-npa-USO706(บ้านวังน้ำต้น หมู่ 7)	17.85656000	100.60846200	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3370	utt-npa-USO714(บ้านป่ากั้ง หมู่ 5)	17.94520000	100.63232300	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3371	utt-brc-USO715(บ้านน้ำพร้า ม.1)	17.96328000	100.39538000	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3372	utt-npa-USO723(บ้านงอมมด หมู่ 2)	18.02000000	100.69597700	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3373	utt-fta-USO741(ห้วยไผ่)	18.29226000	101.10452400	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3374	NT_ชุมสายบ้านร่วมจิตรC300	17.70820047	100.34734716	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3375	NT_ชุมสายลับแลC300	17.65130567	100.04391603	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3376	NT_ชุมสายพิชัยC300	17.28548259	100.08785866	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3377	NT_ชุมสายตรอนC300	17.48235501	100.11499141	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3378	NT_นายาง ม.4	17.30494522	100.20203219	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3379	NT_ชุมสายฟากท่า	17.99349918	100.87516344	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3380	NT_ไผ่ล้อม ม.1	17.58676621	100.06780100	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3381	NT_ทุ่งยั้ง ม.6(วัดพระเเท่น)	17.59723365	100.04736222	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3382	NT_วัดเกษม	17.61846274	100.09121343	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3383	NT_ชุมสายด่านแม่คำมัน หมู่8	17.53539810	99.94527610	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3384	NT_ม่วงเจ็ดต้น ม.2	18.09730387	101.12382251	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3385	NT_ปากฝาง	17.66750606	100.20702309	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3386	NT_ท่าสัก	17.40392369	100.09904047	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3387	NT_ชุมสายท่าปลา	17.78883962	100.37319917	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3388	NT_ป่าเซ่า ม.3	17.60382423	100.11165650	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3389	NT_น้ำหมัน ม.9	17.76440680	100.30558987	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3390	NT_สองห้อง ม.2	17.89263300	100.81979770	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3391	NT_วังกะพี้	17.55520062	100.10788083	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3392	NT_น้ำริด	17.70637860	100.12550636	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3393	NT_สำราญรื่นซอย.8	17.63806000	100.11020300	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3394	NT_น้ำพี้	17.55526534	100.28454389	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3395	NT_ปากปาด	17.73796765	100.55448162	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3396	NT_ชุมสายบ้านโคก	18.02357506	101.06752668	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3397	NT_ทองแสนขัน	17.47016175	100.32766820	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3398	NT_ไร่อ้อย	17.35889200	100.06191010	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3399	NT_ข่อยสูงม.8	17.47572100	99.99341070	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3400	NT_วัดศรีธาราม	17.66768947	100.14833120	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3401	NT_เด่นเหล็ก ม.3	17.83274029	100.78216623	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3402	NT_บ่อทองหมู่7	17.41370761	100.32651723	NT2	อุตรดิตถ์	C	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3403	NT_ ผักขวง ม.3	17.52279248	100.40559976	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3404	NT_น้ำไคร้หมู่2	17.59064168	100.49865254	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3405	NT_บ้านม่วงตาล(Dslamเก่า)	17.28509253	100.07988766	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3406	NT_นาอิน	17.22596509	100.20709860	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3407	NT_นานกกก	17.73133875	100.08352654	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3408	NT_แม่เฉย	17.74549683	100.13382534	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3409	NT_บ้านโคน	17.20296612	100.07339786	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3410	NT_บุ่งจิก	17.56046000	100.13324000	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3411	NT_ทุ่งยั้งหมู่ 7(พงกะชี)	17.59465697	100.00581838	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3412	NT_คุ้งวารี	17.59665080	100.09674649	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3413	NT_ผาเลือด	17.71249361	100.40409545	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3414	NT_กรุงไทย1	17.61336765	100.08928313	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3415	NT_CAB#14(ข้างร้านวิมล)	17.63916577	100.09994816	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3416	NT_CAB#24(หอพักศิริการณ์)	17.63712640	100.09100064	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3417	NT_หน้าค่าย ม.7	17.65530000	100.13107900	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3418	NT_หน้าวัดป่าขนุน	17.64619000	100.13154100	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3419	NT_บ้านแก่ง (สี่เเยกวังตะคร้อ)C620	17.45393000	100.14053100	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3420	NT_น้ำไผ่(หน้า อบต.น้ำไผ่)	17.58166000	100.67819500	NT2	อุตรดิตถ์	D	2026-03-09 01:52:08.425229	\N	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1053	CMI_CMI1CAB017_01_(เชียงใหม่ 1 Cab#017_วังสิงห์คำ)	18.80833883	99.00264035	NT2	เชียงใหม่	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
1044	CMI_CMI2_03_(เชียงใหม่ 2/3)	18.80591411	98.96773192	NT2	เชียงใหม่	A	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
2797	ท่าโป่งแดง	19.27542026	97.95209753	NT2	แม่ฮ่องสอน	D	2026-03-09 01:52:08.425229	t	281b4bed-87e0-47a9-a032-22393cdffd52	{}
3422	test2	18.79203013	98.95212420		เชียงใหม่	ทั่วไป	2026-03-09 04:51:06.453999	t	505e312c-181f-48e8-b8d8-5778df42e0b0	{}
3424	test4	15.70516747	100.07396040		นครสวรรค์	ทั่วไป	2026-03-09 05:15:39.620294	t	505e312c-181f-48e8-b8d8-5778df42e0b0	{}
\.


--
-- Data for Name: project_site_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_site_records (id, project_id, site_id, custom_data, images, created_at, updated_at) FROM stdin;
1	3af1c57d-b62f-4fb6-820f-8a3718316734	3422	{"field_1773039536951": true}	["/api/pms/uploads/test2_3422_1773047834560-979437854.jpg"]	2026-03-09 09:17:17.571467+00	2026-03-09 09:17:17.571467+00
\.


--
-- Data for Name: project_sites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_sites (project_id, site_id, created_at) FROM stdin;
417112d6-005b-4402-b12e-b387abf9139d	1	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	868	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	2	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	869	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	3	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	870	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	4	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	871	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	5	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	872	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	6	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	873	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	7	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	874	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	8	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	875	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	9	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	876	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	10	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	877	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	11	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	878	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	12	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	879	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	13	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	880	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	14	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	881	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	15	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	882	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	16	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	883	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	17	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	884	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	18	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	885	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	19	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	886	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	20	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	887	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	21	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	888	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	22	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	889	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	23	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	890	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	24	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	891	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	25	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	892	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	26	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	893	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	27	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	894	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	28	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	895	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	29	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	896	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	30	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	897	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	31	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	898	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	32	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	899	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	33	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	900	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	34	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	901	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	35	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	902	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	36	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	903	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	37	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	904	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	38	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	905	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	39	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	906	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	40	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	907	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	41	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	908	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	42	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	909	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	43	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	910	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	44	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	911	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	45	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	912	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	46	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	913	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	47	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	914	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	48	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	915	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	49	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	916	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	50	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	917	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	51	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	918	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	52	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	919	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	53	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	920	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	54	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	921	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	55	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	922	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	56	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	923	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	57	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	924	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	58	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	925	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	59	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	926	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	60	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	927	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	61	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	928	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	62	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	929	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	63	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	930	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	64	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	931	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	65	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	932	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	66	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	933	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	67	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	934	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	68	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	935	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	69	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	936	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	70	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	937	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	71	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	938	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	72	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	939	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	73	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	940	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	74	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	941	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	75	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	942	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	76	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	943	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	77	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	944	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	78	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	945	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	79	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	946	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	80	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	947	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	81	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	948	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	82	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	949	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	83	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	950	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	84	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	951	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	85	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	952	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	86	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	953	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	87	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	954	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	88	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	955	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	89	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	956	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	90	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	957	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	91	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	958	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	92	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	959	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	93	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	960	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	94	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	961	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	95	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	962	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	96	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	963	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	97	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	964	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	98	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	965	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	99	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	966	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	100	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	967	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	101	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	968	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	102	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	969	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	103	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	970	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	104	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	971	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	105	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	972	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	106	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	973	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	107	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	974	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	108	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	975	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	109	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	976	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	110	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	977	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	111	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	978	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	112	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	979	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	113	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	980	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	114	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	981	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	115	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	982	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	116	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	983	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	117	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	984	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	118	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	985	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	119	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	986	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	120	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	987	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	121	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	988	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	122	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	989	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	123	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	990	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	124	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	991	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	125	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	992	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	126	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	993	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	127	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	994	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	128	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	995	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	129	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	996	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	130	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	997	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	131	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	998	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	132	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	999	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	133	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1000	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	134	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1001	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	135	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1002	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	136	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1003	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	137	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1004	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	138	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1005	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	139	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1006	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	140	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1007	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	141	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1008	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	142	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1009	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	143	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1010	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	144	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1011	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	145	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1012	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	146	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1013	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	147	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1014	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	148	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1015	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	149	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1016	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	150	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1017	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	151	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1018	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	152	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1019	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	153	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1020	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	154	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1021	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	155	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1022	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	156	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1023	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	157	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1024	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	158	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1025	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	159	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1026	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	160	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1027	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	161	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1028	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	162	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1029	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	163	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1030	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	164	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1031	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	165	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1032	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	166	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1033	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	167	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1034	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	168	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1035	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	169	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1036	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	170	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1037	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	171	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1038	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	172	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1039	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	173	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1040	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	174	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1041	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	175	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1042	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	176	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1043	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	177	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1044	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	178	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1045	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	179	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1046	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	180	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1047	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	181	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1048	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	182	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1049	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	183	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1050	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	184	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1051	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	185	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1052	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	186	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1053	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	187	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1054	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	188	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1055	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	189	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1056	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	190	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1057	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	191	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1058	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	192	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1059	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	193	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1060	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	194	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1061	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	195	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1062	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	196	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1063	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	197	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1064	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	198	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1065	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	199	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1066	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	200	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1067	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	201	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1068	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	202	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1069	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	203	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1070	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	204	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1071	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	205	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1072	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	206	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1073	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	207	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1074	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	208	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1075	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	209	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1076	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	210	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1077	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	211	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1078	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	212	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1079	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	213	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1080	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	214	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1081	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	215	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1082	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	216	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1083	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	217	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1084	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	218	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1085	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	219	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1086	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	220	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1087	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	221	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1088	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	222	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1089	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	223	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1090	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	224	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1091	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	225	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1092	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	226	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1093	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	227	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1094	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	228	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1095	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	229	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1096	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	230	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1097	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	231	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1098	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	232	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1099	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	233	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1100	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	234	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1101	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	235	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1102	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	236	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1103	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	237	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1104	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	238	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1105	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	239	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1106	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	240	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1107	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	241	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1108	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	242	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1109	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	243	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1110	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	244	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1111	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	245	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1112	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	246	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1113	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	247	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1114	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	248	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1115	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	249	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1116	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	250	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1117	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	251	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1118	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	252	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1119	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	253	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1120	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	254	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1121	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	255	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1122	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	256	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1123	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	257	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1124	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	258	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1125	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	259	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1126	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	260	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1127	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	261	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1128	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	262	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1129	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	263	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1130	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	264	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1131	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	265	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1132	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	266	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1133	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	267	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1134	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	268	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1135	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	269	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1136	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	270	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1137	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	271	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1138	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	272	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1139	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	273	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1140	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	274	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1141	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	275	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1142	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	276	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1143	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	277	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1144	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	278	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1145	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	279	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1146	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	280	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	1147	2026-03-09 04:06:28.811296
417112d6-005b-4402-b12e-b387abf9139d	281	2026-03-09 02:49:10.668145
3af1c57d-b62f-4fb6-820f-8a3718316734	3421	2026-03-09 05:32:42.407226
417112d6-005b-4402-b12e-b387abf9139d	282	2026-03-09 02:49:10.668145
3af1c57d-b62f-4fb6-820f-8a3718316734	3422	2026-03-09 05:32:42.407226
417112d6-005b-4402-b12e-b387abf9139d	283	2026-03-09 02:49:10.668145
3af1c57d-b62f-4fb6-820f-8a3718316734	3423	2026-03-09 05:32:42.407226
417112d6-005b-4402-b12e-b387abf9139d	284	2026-03-09 02:49:10.668145
3af1c57d-b62f-4fb6-820f-8a3718316734	3424	2026-03-09 05:32:42.407226
417112d6-005b-4402-b12e-b387abf9139d	285	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	286	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	287	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	288	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	289	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	290	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	291	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	292	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	293	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	294	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	295	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	296	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	297	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	298	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	299	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	300	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	301	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	302	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	303	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	304	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	305	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	306	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	307	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	308	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	309	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	310	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	311	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	312	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	313	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	314	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	315	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	316	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	317	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	318	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	319	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	320	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	321	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	322	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	323	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	324	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	325	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	326	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	327	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	328	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	329	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	330	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	331	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	332	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	333	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	334	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	335	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	336	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	337	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	338	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	339	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	340	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	341	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	342	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	343	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	344	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	345	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	346	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	347	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	348	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	349	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	350	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	351	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	352	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	353	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	354	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	355	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	356	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	357	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	358	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	359	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	360	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	361	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	362	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	363	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	364	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	365	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	366	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	367	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	368	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	369	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	370	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	371	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	372	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	373	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	374	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	375	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	376	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	377	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	378	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	379	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	380	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	381	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	382	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	383	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	384	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	385	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	386	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	387	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	388	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	389	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	390	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	391	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	392	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	393	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	394	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	395	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	396	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	397	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	398	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	399	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	400	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	401	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	402	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	403	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	404	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	405	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	406	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	407	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	408	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	409	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	410	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	411	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	412	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	413	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	414	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	415	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	416	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	417	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	418	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	419	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	420	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	421	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	422	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	423	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	424	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	425	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	426	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	427	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	428	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	429	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	430	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	431	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	432	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	433	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	434	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	435	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	436	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	437	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	438	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	439	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	440	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	441	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	442	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	443	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	444	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	445	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	446	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	447	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	448	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	449	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	450	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	451	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	452	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	453	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	454	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	455	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	456	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	457	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	458	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	459	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	460	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	461	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	462	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	463	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	464	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	465	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	466	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	467	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	468	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	469	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	470	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	471	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	472	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	473	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	474	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	475	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	476	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	477	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	478	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	479	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	480	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	481	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	482	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	483	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	484	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	485	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	486	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	487	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	488	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	489	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	490	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	491	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	492	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	493	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	494	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	495	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	496	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	497	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	498	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	499	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	500	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	501	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	502	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	503	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	504	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	505	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	506	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	507	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	508	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	509	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	510	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	511	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	512	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	513	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	514	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	515	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	516	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	517	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	518	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	519	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	520	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	521	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	522	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	523	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	524	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	525	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	526	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	527	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	528	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	529	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	530	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	531	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	532	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	533	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	534	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	535	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	536	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	537	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	538	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	539	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	540	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	541	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	542	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	543	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	544	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	545	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	546	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	547	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	548	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	549	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	550	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	551	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	552	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	553	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	554	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	555	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	556	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	557	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	558	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	559	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	560	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	561	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	562	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	563	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	564	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	565	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	566	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	567	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	568	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	569	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	570	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	571	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	572	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	573	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	574	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	575	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	576	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	577	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	578	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	579	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	580	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	581	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	582	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	583	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	584	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	585	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	586	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	587	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	588	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	589	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	590	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	591	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	592	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	593	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	594	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	595	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	596	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	597	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	598	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	599	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	600	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	601	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	602	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	603	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	604	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	605	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	606	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	607	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	608	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	609	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	610	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	611	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	612	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	613	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	614	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	615	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	616	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	617	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	618	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	619	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	620	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	621	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	622	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	623	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	624	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	625	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	626	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	627	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	628	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	629	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	630	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	631	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	632	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	633	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	634	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	635	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	636	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	637	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	638	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	639	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	640	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	641	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	642	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	643	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	644	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	645	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	646	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	647	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	648	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	649	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	650	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	651	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	652	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	653	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	654	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	655	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	656	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	657	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	658	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	659	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	660	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	661	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	662	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	663	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	664	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	665	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	666	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	667	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	668	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	669	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	670	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	671	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	672	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	673	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	674	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	675	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	676	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	677	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	678	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	679	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	680	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	681	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	682	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	683	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	684	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	685	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	686	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	687	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	688	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	689	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	690	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	691	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	692	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	693	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	694	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	695	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	696	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	697	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	698	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	699	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	700	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	701	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	702	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	703	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	704	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	705	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	706	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	707	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	708	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	709	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	710	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	711	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	712	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	713	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	714	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	715	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	716	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	717	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	718	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	719	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	720	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	721	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	722	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	723	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	724	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	725	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	726	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	727	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	728	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	729	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	730	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	731	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	732	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	733	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	734	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	735	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	736	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	737	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	738	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	739	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	740	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	741	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	742	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	743	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	744	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	745	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	746	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	747	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	748	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	749	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	750	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	751	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	752	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	753	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	754	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	755	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	756	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	757	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	758	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	759	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	760	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	761	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	762	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	763	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	764	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	765	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	766	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	767	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	768	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	769	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	770	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	771	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	772	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	773	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	774	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	775	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	776	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	777	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	778	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	779	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	780	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	781	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	782	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	783	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	784	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	785	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	786	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	787	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	788	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	789	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	790	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	791	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	792	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	793	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	794	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	795	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	796	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	797	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	798	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	799	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	800	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	801	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	802	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	803	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	804	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	805	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	806	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	807	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	808	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	809	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	810	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	811	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	812	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	813	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	814	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	815	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	816	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	817	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	818	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	819	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	820	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	821	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	822	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	823	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	824	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	825	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	826	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	827	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	828	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	829	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	830	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	831	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	832	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	833	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	834	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	835	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	836	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	837	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	838	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	839	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	840	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	841	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	842	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	843	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	844	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	845	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	846	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	847	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	848	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	849	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	850	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	851	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	852	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	853	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	854	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	855	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	856	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	857	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	858	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	859	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	860	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	861	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	862	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	863	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	864	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	865	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	866	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	867	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	868	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	869	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	870	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	871	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	872	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	873	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	874	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	875	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	876	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	877	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	878	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	879	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	880	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	881	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	882	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	883	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	884	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	885	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	886	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	887	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	888	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	889	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	890	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	891	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	892	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	893	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	894	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	895	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	896	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	897	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	898	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	899	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	900	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	901	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	902	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	903	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	904	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	905	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	906	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	907	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	908	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	909	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	910	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	911	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	912	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	913	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	914	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	915	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	916	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	917	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	918	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	919	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	920	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	921	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	922	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	923	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	924	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	925	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	926	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	927	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	928	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	929	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	930	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	931	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	932	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	933	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	934	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	935	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	936	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	937	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	938	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	939	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	940	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	941	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	942	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	943	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	944	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	945	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	946	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	947	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	948	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	949	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	950	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	951	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	952	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	953	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	954	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	955	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	956	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	957	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	958	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	959	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	960	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	961	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	962	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	963	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	964	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	965	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	966	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	967	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	968	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	969	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	970	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	971	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	972	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	973	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	974	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	975	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	976	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	977	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	978	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	979	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	980	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	981	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	982	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	983	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	984	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	985	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	986	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	987	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	988	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	989	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	990	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	991	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	992	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	993	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	994	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	995	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	996	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	997	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	998	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	999	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1000	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1001	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1002	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1003	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1004	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1005	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1006	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1007	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1008	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1009	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1010	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1011	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1012	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1013	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1014	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1015	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1016	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1017	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1018	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1019	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1020	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1021	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1022	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1023	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1024	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1025	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1026	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1027	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1028	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1029	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1030	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1031	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1032	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1033	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1034	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1035	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1036	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1037	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1038	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1039	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1040	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1041	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1042	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1043	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1044	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1045	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1046	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1047	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1048	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1049	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1050	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1051	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1052	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1053	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1054	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1055	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1056	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1057	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1058	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1059	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1060	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1061	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1062	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1063	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1064	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1065	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1066	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1067	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1068	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1069	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1070	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1071	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1072	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1073	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1074	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1075	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1076	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1077	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1078	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1079	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1080	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1081	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1082	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1083	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1084	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1085	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1086	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1087	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1088	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1089	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1090	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1091	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1092	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1093	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1094	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1095	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1096	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1097	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1098	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1099	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1100	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1101	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1102	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1103	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1104	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1105	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1106	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1107	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1108	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1109	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1110	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1111	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1112	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1113	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1114	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1115	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1116	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1117	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1118	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1119	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1120	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1121	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1122	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1123	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1124	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1125	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1126	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1127	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1128	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1129	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1130	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1131	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1132	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1133	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1134	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1135	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1136	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1137	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1138	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1139	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1140	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1141	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1142	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1143	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1144	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1145	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1146	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1147	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1148	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1149	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1150	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1151	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1152	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1153	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1154	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1155	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1156	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1157	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1158	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1159	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1160	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1161	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1162	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1163	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1164	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1165	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1166	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1167	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1168	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1169	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1170	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1171	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1172	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1173	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1174	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1175	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1176	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1177	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1178	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1179	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1180	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1181	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1182	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1183	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1184	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1185	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1186	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1187	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1188	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1189	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1190	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1191	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1192	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1193	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1194	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1195	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1196	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1197	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1198	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1199	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1200	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1201	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1202	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1203	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1204	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1205	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1206	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1207	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1208	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1209	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1210	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1211	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1212	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1213	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1214	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1215	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1216	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1217	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1218	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1219	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1220	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1221	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1222	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1223	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1224	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1225	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1226	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1227	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1228	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1229	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1230	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1231	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1232	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1233	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1234	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1235	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1236	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1237	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1238	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1239	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1240	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1241	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1242	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1243	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1244	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1245	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1246	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1247	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1248	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1249	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1250	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1251	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1252	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1253	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1254	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1255	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1256	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1257	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1258	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1259	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1260	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1261	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1262	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1263	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1264	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1265	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1266	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1267	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1268	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1269	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1270	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1271	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1272	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1273	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1274	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1275	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1276	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1277	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1278	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1279	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1280	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1281	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1282	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1283	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1284	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1285	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1286	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1287	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1288	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1289	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1290	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1291	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1292	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1293	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1294	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1295	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1296	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1297	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1298	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1299	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1300	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1301	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1302	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1303	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1304	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1305	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1306	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1307	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1308	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1309	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1310	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1311	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1312	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1313	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1314	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1315	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1316	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1317	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1318	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1319	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1320	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1321	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1322	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1323	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1324	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1325	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1326	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1327	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1328	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1329	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1330	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1331	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1332	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1333	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1334	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1335	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1336	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1337	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1338	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1339	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1340	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1341	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1342	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1343	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1344	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1345	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1346	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1347	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1348	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1349	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1350	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1351	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1352	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1353	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1354	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1355	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1356	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1357	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1358	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1359	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1360	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1361	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1362	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1363	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1364	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1365	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1366	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1367	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1368	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1369	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1370	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1371	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1372	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1373	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1374	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1375	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1376	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1377	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1378	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1379	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1380	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1381	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1382	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1383	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1384	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1385	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1386	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1387	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1388	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1389	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1390	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1391	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1392	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1393	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1394	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1395	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1396	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1397	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1398	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1399	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1400	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1401	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1402	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1403	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1404	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1405	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1406	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1407	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1408	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1409	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1410	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1411	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1412	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1413	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1414	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1415	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1416	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1417	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1418	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1419	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1420	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1421	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1422	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1423	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1424	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1425	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1426	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1427	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1428	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1429	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1430	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1431	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1432	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1433	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1434	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1435	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1436	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1437	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1438	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1439	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1440	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1441	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1442	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1443	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1444	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1445	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1446	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1447	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1448	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1449	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1450	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1451	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1452	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1453	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1454	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1455	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1456	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1457	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1458	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1459	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1460	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1461	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1462	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1463	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1464	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1465	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1466	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1467	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1468	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1469	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1470	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1471	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1472	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1473	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1474	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1475	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1476	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1477	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1478	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1479	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1480	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1481	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1482	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1483	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1484	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1485	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1486	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1487	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1488	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1489	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1490	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1491	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1492	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1493	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1494	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1495	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1496	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1497	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1498	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1499	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1500	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1501	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1502	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1503	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1504	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1505	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1506	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1507	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1508	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1509	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1510	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1511	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1512	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1513	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1514	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1515	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1516	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1517	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1518	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1519	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1520	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1521	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1522	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1523	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1524	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1525	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1526	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1527	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1528	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1529	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1530	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1531	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1532	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1533	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1534	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1535	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1536	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1537	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1538	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1539	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1540	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1541	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1542	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1543	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1544	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1545	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1546	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1547	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1548	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1549	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1550	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1551	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1552	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1553	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1554	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1555	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1556	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1557	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1558	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1559	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1560	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1561	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1562	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1563	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1564	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1565	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1566	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1567	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1568	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1569	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1570	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1571	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1572	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1573	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1574	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1575	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1576	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1577	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1578	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1579	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1580	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1581	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1582	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1583	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1584	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1585	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1586	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1587	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1588	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1589	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1590	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1591	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1592	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1593	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1594	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1595	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1596	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1597	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1598	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1599	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1600	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1601	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1602	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1603	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1604	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1605	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1606	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1607	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1608	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1609	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1610	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1611	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1612	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1613	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1614	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1615	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1616	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1617	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1618	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1619	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1620	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1621	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1622	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1623	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1624	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1625	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1626	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1627	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1628	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1629	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1630	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1631	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1632	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1633	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1634	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1635	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1636	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1637	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1638	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1639	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1640	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1641	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1642	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1643	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1644	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1645	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1646	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1647	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1648	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1649	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1650	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1651	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1652	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1653	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1654	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1655	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1656	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1657	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1658	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1659	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1660	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1661	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1662	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1663	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1664	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1665	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1666	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1667	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1668	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1669	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1670	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1671	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1672	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1673	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1674	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1675	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1676	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1677	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1678	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1679	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1680	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1681	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1682	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1683	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1684	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1685	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1686	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1687	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1688	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1689	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1690	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1691	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1692	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1693	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1694	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1695	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1696	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1697	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1698	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1699	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1700	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1701	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1702	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1703	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1704	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1705	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1706	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1707	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1708	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1709	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1710	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1711	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1712	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1713	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1714	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1715	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1716	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1717	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1718	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1719	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1720	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1721	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1722	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1723	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1724	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1725	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1726	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1727	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1728	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1729	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1730	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1731	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1732	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1733	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1734	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1735	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1736	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1737	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1738	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1739	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1740	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1741	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1742	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1743	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1744	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1745	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1746	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1747	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1748	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1749	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1750	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1751	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1752	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1753	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1754	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1755	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1756	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1757	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1758	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1759	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1760	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1761	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1762	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1763	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1764	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1765	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1766	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1767	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1768	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1769	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1770	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1771	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1772	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1773	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1774	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1775	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1776	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1777	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1778	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1779	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1780	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1781	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1782	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1783	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1784	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1785	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1786	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1787	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1788	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1789	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1790	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1791	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1792	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1793	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1794	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1795	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1796	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1797	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1798	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1799	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1800	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1801	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1802	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1803	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1804	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1805	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1806	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1807	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1808	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1809	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1810	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1811	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1812	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1813	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1814	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1815	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1816	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1817	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1818	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1819	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1820	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1821	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1822	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1823	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1824	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1825	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1826	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1827	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1828	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1829	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1830	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1831	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1832	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1833	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1834	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1835	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1836	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1837	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1838	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1839	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1840	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1841	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1842	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1843	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1844	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1845	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1846	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1847	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1848	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1849	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1850	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1851	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1852	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1853	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1854	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1855	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1856	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1857	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1858	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1859	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1860	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1861	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1862	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1863	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1864	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1865	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1866	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1867	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1868	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1869	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1870	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1871	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1872	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1873	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1874	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1875	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1876	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1877	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1878	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1879	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1880	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1881	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1882	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1883	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1884	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1885	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1886	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1887	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1888	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1889	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1890	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1891	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1892	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1893	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1894	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1895	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1896	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1897	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1898	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1899	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1900	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1901	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1902	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1903	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1904	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1905	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1906	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1907	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1908	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1909	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1910	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1911	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1912	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1913	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1914	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1915	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1916	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1917	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1918	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1919	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1920	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1921	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1922	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1923	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1924	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1925	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1926	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1927	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1928	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1929	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1930	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1931	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1932	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1933	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1934	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1935	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1936	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1937	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1938	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1939	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1940	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1941	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1942	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1943	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1944	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1945	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1946	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1947	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1948	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1949	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1950	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1951	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1952	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1953	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1954	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1955	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1956	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1957	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1958	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1959	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1960	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1961	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1962	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1963	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1964	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1965	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1966	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1967	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1968	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1969	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1970	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1971	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1972	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1973	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1974	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1975	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1976	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1977	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1978	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1979	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1980	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1981	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1982	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1983	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1984	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1985	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1986	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1987	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1988	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1989	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1990	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1991	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1992	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1993	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1994	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1995	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1996	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1997	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1998	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	1999	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2000	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2001	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2002	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2003	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2004	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2005	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2006	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2007	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2008	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2009	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2010	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2011	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2012	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2013	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2014	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2015	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2016	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2017	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2018	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2019	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2020	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2021	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2022	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2023	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2024	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2025	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2026	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2027	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2028	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2029	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2030	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2031	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2032	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2033	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2034	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2035	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2036	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2037	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2038	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2039	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2040	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2041	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2042	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2043	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2044	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2045	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2046	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2047	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2048	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2049	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2050	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2051	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2052	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2053	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2054	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2055	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2056	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2057	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2058	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2059	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2060	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2061	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2062	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2063	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2064	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2065	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2066	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2067	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2068	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2069	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2070	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2071	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2072	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2073	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2074	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2075	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2076	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2077	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2078	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2079	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2080	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2081	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2082	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2083	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2084	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2085	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2086	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2087	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2088	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2089	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2090	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2091	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2092	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2093	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2094	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2095	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2096	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2097	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2098	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2099	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2100	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2101	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2102	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2103	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2104	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2105	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2106	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2107	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2108	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2109	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2110	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2111	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2112	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2113	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2114	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2115	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2116	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2117	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2118	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2119	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2120	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2121	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2122	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2123	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2124	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2125	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2126	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2127	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2128	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2129	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2130	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2131	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2132	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2133	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2134	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2135	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2136	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2137	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2138	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2139	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2140	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2141	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2142	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2143	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2144	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2145	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2146	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2147	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2148	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2149	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2150	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2151	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2152	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2153	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2154	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2155	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2156	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2157	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2158	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2159	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2160	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2161	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2162	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2163	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2164	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2165	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2166	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2167	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2168	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2169	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2170	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2171	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2172	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2173	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2174	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2175	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2176	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2177	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2178	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2179	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2180	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2181	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2182	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2183	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2184	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2185	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2186	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2187	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2188	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2189	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2190	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2191	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2192	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2193	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2194	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2195	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2196	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2197	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2198	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2199	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2200	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2201	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2202	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2203	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2204	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2205	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2206	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2207	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2208	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2209	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2210	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2211	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2212	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2213	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2214	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2215	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2216	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2217	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2218	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2219	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2220	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2221	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2222	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2223	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2224	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2225	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2226	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2227	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2228	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2229	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2230	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2231	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2232	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2233	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2234	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2235	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2236	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2237	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2238	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2239	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2240	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2241	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2242	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2243	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2244	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2245	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2246	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2247	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2248	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2249	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2250	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2251	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2252	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2253	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2254	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2255	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2256	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2257	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2258	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2259	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2260	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2261	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2262	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2263	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2264	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2265	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2266	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2267	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2268	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2269	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2270	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2271	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2272	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2273	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2274	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2275	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2276	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2277	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2278	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2279	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2280	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2281	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2282	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2283	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2284	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2285	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2286	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2287	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2288	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2289	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2290	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2291	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2292	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2293	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2294	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2295	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2296	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2297	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2298	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2299	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2300	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2301	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2302	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2303	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2304	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2305	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2306	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2307	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2308	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2309	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2310	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2311	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2312	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2313	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2314	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2315	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2316	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2317	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2318	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2319	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2320	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2321	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2322	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2323	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2324	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2325	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2326	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2327	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2328	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2329	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2330	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2331	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2332	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2333	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2334	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2335	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2336	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2337	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2338	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2339	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2340	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2341	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2342	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2343	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2344	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2345	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2346	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2347	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2348	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2349	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2350	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2351	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2352	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2353	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2354	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2355	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2356	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2357	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2358	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2359	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2360	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2361	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2362	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2363	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2364	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2365	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2366	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2367	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2368	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2369	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2370	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2371	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2372	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2373	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2374	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2375	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2376	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2377	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2378	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2379	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2380	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2381	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2382	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2383	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2384	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2385	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2386	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2387	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2388	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2389	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2390	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2391	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2392	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2393	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2394	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2395	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2396	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2397	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2398	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2399	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2400	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2401	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2402	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2403	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2404	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2405	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2406	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2407	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2408	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2409	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2410	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2411	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2412	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2413	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2414	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2415	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2416	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2417	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2418	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2419	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2420	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2421	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2422	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2423	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2424	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2425	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2426	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2427	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2428	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2429	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2430	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2431	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2432	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2433	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2434	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2435	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2436	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2437	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2438	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2439	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2440	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2441	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2442	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2443	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2444	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2445	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2446	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2447	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2448	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2449	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2450	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2451	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2452	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2453	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2454	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2455	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2456	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2457	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2458	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2459	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2460	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2461	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2462	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2463	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2464	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2465	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2466	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2467	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2468	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2469	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2470	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2471	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2472	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2473	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2474	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2475	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2476	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2477	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2478	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2479	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2480	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2481	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2482	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2483	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2484	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2485	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2486	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2487	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2488	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2489	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2490	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2491	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2492	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2493	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2494	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2495	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2496	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2497	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2498	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2499	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2500	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2501	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2502	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2503	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2504	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2505	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2506	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2507	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2508	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2509	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2510	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2511	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2512	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2513	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2514	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2515	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2516	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2517	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2518	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2519	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2520	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2521	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2522	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2523	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2524	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2525	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2526	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2527	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2528	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2529	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2530	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2531	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2532	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2533	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2534	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2535	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2536	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2537	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2538	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2539	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2540	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2541	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2542	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2543	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2544	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2545	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2546	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2547	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2548	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2549	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2550	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2551	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2552	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2553	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2554	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2555	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2556	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2557	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2558	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2559	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2560	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2561	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2562	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2563	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2564	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2565	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2566	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2567	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2568	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2569	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2570	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2571	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2572	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2573	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2574	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2575	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2576	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2577	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2578	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2579	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2580	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2581	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2582	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2583	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2584	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2585	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2586	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2587	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2588	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2589	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2590	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2591	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2592	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2593	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2594	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2595	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2596	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2597	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2598	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2599	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2600	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2601	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2602	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2603	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2604	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2605	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2606	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2607	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2608	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2609	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2610	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2611	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2612	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2613	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2614	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2615	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2616	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2617	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2618	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2619	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2620	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2621	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2622	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2623	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2624	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2625	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2626	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2627	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2628	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2629	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2630	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2631	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2632	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2633	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2634	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2635	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2636	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2637	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2638	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2639	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2640	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2641	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2642	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2643	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2644	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2645	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2646	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2647	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2648	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2649	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2650	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2651	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2652	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2653	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2654	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2655	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2656	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2657	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2658	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2659	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2660	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2661	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2662	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2663	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2664	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2665	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2666	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2667	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2668	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2669	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2670	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2671	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2672	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2673	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2674	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2675	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2676	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2677	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2678	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2679	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2680	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2681	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2682	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2683	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2684	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2685	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2686	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2687	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2688	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2689	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2690	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2691	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2692	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2693	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2694	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2695	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2696	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2697	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2698	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2699	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2700	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2701	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2702	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2703	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2704	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2705	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2706	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2707	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2708	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2709	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2710	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2711	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2712	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2713	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2714	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2715	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2716	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2717	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2718	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2719	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2720	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2721	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2722	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2723	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2724	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2725	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2726	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2727	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2728	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2729	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2730	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2731	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2732	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2733	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2734	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2735	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2736	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2737	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2738	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2739	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2740	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2741	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2742	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2743	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2744	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2745	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2746	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2747	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2748	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2749	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2750	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2751	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2752	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2753	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2754	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2755	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2756	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2757	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2758	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2759	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2760	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2761	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2762	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2763	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2764	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2765	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2766	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2767	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2768	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2769	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2770	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2771	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2772	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2773	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2774	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2775	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2776	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2777	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2778	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2779	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2780	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2781	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2782	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2783	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2784	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2785	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2786	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2787	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2788	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2789	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2790	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2791	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2792	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2793	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2794	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2795	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2796	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2797	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2798	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2799	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2800	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2801	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2802	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2803	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2804	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2805	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2806	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2807	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2808	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2809	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2810	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2811	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2812	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2813	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2814	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2815	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2816	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2817	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2818	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2819	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2820	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2821	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2822	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2823	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2824	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2825	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2826	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2827	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2828	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2829	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2830	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2831	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2832	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2833	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2834	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2835	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2836	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2837	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2838	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2839	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2840	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2841	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2842	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2843	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2844	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2845	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2846	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2847	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2848	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2849	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2850	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2851	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2852	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2853	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2854	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2855	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2856	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2857	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2858	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2859	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2860	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2861	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2862	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2863	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2864	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2865	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2866	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2867	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2868	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2869	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2870	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2871	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2872	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2873	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2874	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2875	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2876	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2877	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2878	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2879	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2880	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2881	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2882	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2883	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2884	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2885	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2886	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2887	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2888	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2889	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2890	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2891	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2892	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2893	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2894	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2895	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2896	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2897	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2898	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2899	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2900	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2901	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2902	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2903	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2904	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2905	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2906	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2907	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2908	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2909	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2910	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2911	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2912	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2913	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2914	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2915	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2916	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2917	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2918	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2919	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2920	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2921	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2922	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2923	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2924	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2925	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2926	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2927	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2928	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2929	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2930	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2931	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2932	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2933	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2934	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2935	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2936	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2937	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2938	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2939	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2940	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2941	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2942	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2943	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2944	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2945	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2946	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2947	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2948	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2949	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2950	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2951	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2952	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2953	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2954	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2955	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2956	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2957	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2958	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2959	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2960	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2961	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2962	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2963	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2964	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2965	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2966	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2967	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2968	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2969	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2970	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2971	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2972	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2973	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2974	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2975	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2976	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2977	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2978	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2979	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2980	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2981	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2982	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2983	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2984	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2985	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2986	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2987	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2988	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2989	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2990	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2991	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2992	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2993	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2994	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2995	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2996	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2997	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2998	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	2999	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3000	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3001	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3002	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3003	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3004	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3005	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3006	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3007	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3008	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3009	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3010	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3011	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3012	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3013	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3014	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3015	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3016	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3017	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3018	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3019	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3020	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3021	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3022	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3023	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3024	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3025	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3026	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3027	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3028	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3029	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3030	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3031	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3032	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3033	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3034	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3035	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3036	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3037	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3038	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3039	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3040	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3041	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3042	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3043	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3044	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3045	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3046	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3047	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3048	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3049	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3050	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3051	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3052	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3053	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3054	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3055	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3056	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3057	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3058	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3059	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3060	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3061	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3062	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3063	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3064	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3065	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3066	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3067	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3068	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3069	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3070	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3071	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3072	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3073	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3074	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3075	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3076	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3077	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3078	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3079	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3080	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3081	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3082	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3083	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3084	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3085	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3086	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3087	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3088	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3089	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3090	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3091	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3092	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3093	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3094	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3095	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3096	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3097	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3098	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3099	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3100	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3101	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3102	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3103	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3104	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3105	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3106	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3107	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3108	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3109	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3110	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3111	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3112	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3113	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3114	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3115	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3116	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3117	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3118	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3119	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3120	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3121	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3122	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3123	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3124	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3125	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3126	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3127	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3128	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3129	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3130	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3131	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3132	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3133	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3134	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3135	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3136	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3137	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3138	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3139	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3140	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3141	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3142	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3143	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3144	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3145	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3146	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3147	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3148	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3149	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3150	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3151	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3152	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3153	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3154	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3155	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3156	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3157	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3158	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3159	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3160	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3161	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3162	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3163	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3164	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3165	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3166	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3167	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3168	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3169	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3170	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3171	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3172	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3173	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3174	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3175	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3176	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3177	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3178	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3179	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3180	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3181	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3182	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3183	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3184	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3185	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3186	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3187	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3188	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3189	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3190	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3191	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3192	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3193	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3194	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3195	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3196	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3197	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3198	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3199	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3200	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3201	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3202	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3203	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3204	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3205	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3206	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3207	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3208	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3209	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3210	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3211	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3212	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3213	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3214	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3215	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3216	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3217	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3218	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3219	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3220	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3221	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3222	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3223	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3224	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3225	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3226	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3227	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3228	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3229	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3230	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3231	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3232	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3233	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3234	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3235	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3236	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3237	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3238	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3239	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3240	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3241	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3242	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3243	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3244	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3245	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3246	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3247	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3248	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3249	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3250	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3251	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3252	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3253	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3254	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3255	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3256	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3257	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3258	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3259	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3260	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3261	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3262	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3263	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3264	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3265	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3266	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3267	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3268	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3269	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3270	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3271	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3272	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3273	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3274	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3275	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3276	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3277	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3278	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3279	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3280	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3281	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3282	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3283	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3284	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3285	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3286	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3287	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3288	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3289	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3290	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3291	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3292	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3293	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3294	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3295	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3296	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3297	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3298	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3299	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3300	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3301	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3302	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3303	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3304	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3305	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3306	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3307	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3308	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3309	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3310	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3311	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3312	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3313	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3314	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3315	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3316	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3317	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3318	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3319	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3320	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3321	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3322	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3323	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3324	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3325	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3326	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3327	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3328	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3329	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3330	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3331	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3332	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3333	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3334	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3335	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3336	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3337	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3338	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3339	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3340	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3341	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3342	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3343	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3344	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3345	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3346	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3347	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3348	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3349	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3350	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3351	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3352	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3353	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3354	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3355	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3356	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3357	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3358	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3359	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3360	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3361	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3362	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3363	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3364	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3365	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3366	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3367	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3368	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3369	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3370	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3371	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3372	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3373	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3374	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3375	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3376	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3377	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3378	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3379	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3380	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3381	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3382	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3383	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3384	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3385	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3386	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3387	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3388	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3389	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3390	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3391	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3392	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3393	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3394	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3395	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3396	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3397	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3398	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3399	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3400	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3401	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3402	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3403	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3404	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3405	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3406	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3407	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3408	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3409	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3410	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3411	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3412	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3413	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3414	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3415	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3416	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3417	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3418	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3419	2026-03-09 02:49:10.668145
417112d6-005b-4402-b12e-b387abf9139d	3420	2026-03-09 02:49:10.668145
7808dbb6-3d7c-4481-9898-e71b7a909054	855	2026-03-09 03:54:58.723776
7808dbb6-3d7c-4481-9898-e71b7a909054	856	2026-03-09 03:54:58.819067
7808dbb6-3d7c-4481-9898-e71b7a909054	857	2026-03-09 03:54:58.90889
7808dbb6-3d7c-4481-9898-e71b7a909054	858	2026-03-09 03:54:59.000639
7808dbb6-3d7c-4481-9898-e71b7a909054	859	2026-03-09 03:54:59.092881
7808dbb6-3d7c-4481-9898-e71b7a909054	860	2026-03-09 03:54:59.182275
7808dbb6-3d7c-4481-9898-e71b7a909054	861	2026-03-09 03:54:59.27306
7808dbb6-3d7c-4481-9898-e71b7a909054	862	2026-03-09 03:54:59.367189
7808dbb6-3d7c-4481-9898-e71b7a909054	863	2026-03-09 03:54:59.456737
7808dbb6-3d7c-4481-9898-e71b7a909054	864	2026-03-09 03:54:59.553498
7808dbb6-3d7c-4481-9898-e71b7a909054	865	2026-03-09 03:54:59.643062
7808dbb6-3d7c-4481-9898-e71b7a909054	866	2026-03-09 03:54:59.73198
7808dbb6-3d7c-4481-9898-e71b7a909054	867	2026-03-09 03:54:59.822762
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, status, color, equipment_types, work_type, created_at, filter_config, fields_schema) FROM stdin;
417112d6-005b-4402-b12e-b387abf9139d	NT North	active	#3b82f6	["AC", "Battery", "Generator"]	PM	2026-02-17 07:43:10.156016	\N	[]
7808dbb6-3d7c-4481-9898-e71b7a909054	test	active	#10b981	["Infrastructure", "Security"]	Survey	2026-03-09 01:16:17.347798	\N	[]
3af1c57d-b62f-4fb6-820f-8a3718316734	ตรวจสอบ 24k	active	#ff0000	["Infrastructure", "Security"]	Survey	2026-03-09 05:27:38.054436	{"allowedTypes": []}	[{"id": "field_1773039536951", "type": "checkbox", "label": "Consumer Unit", "required": true}]
\.


--
-- Data for Name: schedule_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_items (id, project_id, equipment_type, start_month, duration, label, created_at) FROM stdin;
\.


--
-- Name: nt_site_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nt_site_images_id_seq', 184, true);


--
-- Name: nt_sites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nt_sites_id_seq', 3424, true);


--
-- Name: project_site_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_site_records_id_seq', 1, true);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintenance_records maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (id);


--
-- Name: map_layers map_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_layers
    ADD CONSTRAINT map_layers_pkey PRIMARY KEY (id);


--
-- Name: nt_locations nt_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_locations
    ADD CONSTRAINT nt_locations_pkey PRIMARY KEY (id);


--
-- Name: nt_site_images nt_site_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_site_images
    ADD CONSTRAINT nt_site_images_pkey PRIMARY KEY (id);


--
-- Name: nt_sites nt_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_sites
    ADD CONSTRAINT nt_sites_pkey PRIMARY KEY (id);


--
-- Name: project_site_records project_site_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_records
    ADD CONSTRAINT project_site_records_pkey PRIMARY KEY (id);


--
-- Name: project_site_records project_site_records_project_id_site_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_records
    ADD CONSTRAINT project_site_records_project_id_site_id_key UNIQUE (project_id, site_id);


--
-- Name: project_sites project_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_sites
    ADD CONSTRAINT project_sites_pkey PRIMARY KEY (project_id, site_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: schedule_items schedule_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_items
    ADD CONSTRAINT schedule_items_pkey PRIMARY KEY (id);


--
-- Name: nt_sites fk_map_layers; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_sites
    ADD CONSTRAINT fk_map_layers FOREIGN KEY (map_id) REFERENCES public.map_layers(id);


--
-- Name: maintenance_records maintenance_records_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: maintenance_records maintenance_records_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: nt_locations nt_locations_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_locations
    ADD CONSTRAINT nt_locations_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.nt_sites(id) ON DELETE SET NULL;


--
-- Name: nt_site_images nt_site_images_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nt_site_images
    ADD CONSTRAINT nt_site_images_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.nt_sites(id) ON DELETE CASCADE;


--
-- Name: project_site_records project_site_records_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_records
    ADD CONSTRAINT project_site_records_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_site_records project_site_records_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_site_records
    ADD CONSTRAINT project_site_records_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.nt_sites(id) ON DELETE CASCADE;


--
-- Name: project_sites project_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_sites
    ADD CONSTRAINT project_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_sites project_sites_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_sites
    ADD CONSTRAINT project_sites_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.nt_sites(id) ON DELETE CASCADE;


--
-- Name: schedule_items schedule_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_items
    ADD CONSTRAINT schedule_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict JM33zT6u1a4vuMgYMr1zrmsIyJe7PXxHD4lyXbRP9ZkxIaS7vOSWIY4BXN3ml9E

