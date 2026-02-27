import pandas as pd
import os
import random
from google.colab import files  # สำหรับใช้งานบน Colab

def get_file_path_colab():
    print("--- กรุณาอัปโหลดไฟล์ Excel (RD05) ---")
    uploaded = files.upload()
    if not uploaded:
        return None, None

    # ดึงชื่อไฟล์แรกที่อัปโหลด
    file_name = list(uploaded.keys())[0]
    file_path = os.path.abspath(file_name)
    return file_name, file_path

def Group_Select(file_rd05):
    try:
        # 1. อ่านไฟล์ (ข้าม 8 แถวแรกตามโครงสร้างเดิมของคุณ)
        df = pd.read_excel(file_rd05, skiprows=8, header=None)

        # ตั้งชื่อ Column (21 คอลัมน์หลัก + 1 คอลัมน์ Index เดิมที่ถูกอ่านมา)
        # เนื่องจากคุณใช้ index_col=0 ในโค้ดเดิม ผมจะใช้การกำหนด columns โดยตรง
        cols = ["PEA", "Route_Name", "Tag", "Owner", "Concession",
                "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
                "Total_Distance", "Distance_in_Area", "Installation", "Compensation",
                "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
                "Data_Source", "Username", "Name_Lastname", "Date_Edit"]

        # ตรวจสอบจำนวนคอลัมน์ให้ตรงกับข้อมูลจริง (ตัดคอลัมน์ส่วนเกินถ้ามี)
        df = df.iloc[:, 1:22]
        df.columns = cols

        print('✅ สร้างหัวตารางเรียบร้อยแล้ว')

        # สร้าง Column สำหรับจัดกลุ่ม
        df['GroupConcession'] = pd.NA
        df['Group'] = pd.NA

        # นำแถวว่างออกจากข้อมูล โดยดูจาก PEA
        df.dropna(subset=['PEA'], inplace=True)

        # --- ส่วนการ Export ค่า Unique ออกมาตรวจสอบ ---
        with pd.ExcelWriter('data_summary.xlsx') as writer:
            for col_name in ['Line_Type', 'Cores', 'Diameter', 'Concession']:
                unique_df = pd.DataFrame(sorted(df[col_name].unique()), columns=[col_name])
                unique_df.to_excel(writer, sheet_name=col_name, index=False)
        print('✅ บันทึกไฟล์สรุปค่า Unique ไว้ที่ data_summary.xlsx')

        # --- 2. การจัดกลุ่ม GroupConcession ---

        # กลุ่ม กระทรวงดิจิทัล
        digi_list = ['กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม', 'กระทรวงดิจิทัลเศรษฐกิจและสังคมตรวจสอบเส้นทางแล้ว']
        df.loc[df['Concession'].isin(digi_list), 'GroupConcession'] = 'กระทรวจดิจิทัล'

        # กลุ่ม กสทช
        nbtc_list = ['NBTC/CAT', 'NBTC/TOT']
        df.loc[df['Concession'].isin(nbtc_list), 'GroupConcession'] = 'กสทช'

        # กลุ่ม NT
        nt_list = ['-', 'บริษัท กสท โทรคมนาคม จำกัด(มหาชน)', 'บริษัท ทีโอที จำกัด(มหาชน)',
                   'ย้ายข้อมูลจากTAMS1', 'Cleansing ข้อมูลสายสื่อสาร', 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)']
        df.loc[df['Concession'].isin(nt_list), 'GroupConcession'] = 'NT'

        # กลุ่ม สัมปทาน NT
        con_nt_list = ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)',
                       'CAT-TAC #สัมปทาน', 'TOT/AIS #สัมปทาน', 'TOT-TT&T #สัมปทาน',
                       'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'บริษัท บีเอฟเคที จำกัด']
        df.loc[df['Concession'].isin(con_nt_list), 'GroupConcession'] = 'สัมปทาน NT'

        # กลุ่ม ไม่ใช่สัมปทาน NT
        non_nt_list = ['Big Patrol', 'CAT-SINET #สัมปทาน', 'CAT-TRUE #สัมปทาน', 'เคเบิ้ลทีวี (รวม)',
                       'บริษัท เอแอลที เทเลคอม จำกัด (มหาชน)', 'บริษัท แอดวานซ์ ไวร์เลส เน็ทเวอร์ค จำกัด',
                       'บริษัท ไซแมท เทคโนโลยี จำกัด (มหาชน)', 'บริษัท ดีแทค ไตรเน็ต จำกัด',
                       'บริษัท ทริปเปิลที บรอดแบนด์ จำกัด (มหาชน)', 'บริษัท ทริปเปิลที อินเทอร์เน็ต จำกัด',
                       'บริษัท ทรู มูฟ เอช ยูนิเวอร์แซล คอมมิวนิเคชั่น จำกัด', 'บริษัท ทรู มูฟ จำกัด (มหาชน)',
                       'บริษัท ทรู อินเทอร์เน็ต คอร์ปอเรชั่น จำกัด', 'บริษัท พีทีที  ไอซีที โซลูชั่น จำกัด',
                       'บริษัท ยูไนเต็ด อินฟอร์เมชั่น ไฮเวย์ จำกัด', 'บริษัท อินเตอร์ลิ้งค์ เทเลคอม จำกัด (มหาชน)',
                       'บริษัท ฮัทชิสัน ซีเอที ไวร์เลส มัลติมีเดีย จำกัด', 'สำนักงานบริหารเทคโนโลยีสารสนเทศเพื่อพัฒนาการศึกษา (สกอ.)']
        df.loc[df['Concession'].isin(non_nt_list), 'GroupConcession'] = 'ไม่ใช่สัมปทาน NT'

        # --- 3. การจัดประเภท Group (1.1 - 6.2) ---

        # ใช้ .loc ในการแก้ไขข้อมูลเพื่อความรวดเร็วและแม่นยำ
        df.loc[df['GroupConcession'] == 'กระทรวจดิจิทัล', 'Group'] = '1.1'

        # 2.1 NT + Dropwire
        df.loc[(df['GroupConcession'] == 'NT') &
               (df['Line_Type'] == 'เส้นใยแก้วนำแสง(dropwire)') &
               (df['Diameter'].between(5, 8)) &
               (df['Total_Distance'] > 0) & (df['Total_Distance'] < 0.5), 'Group'] = '2.1'

        # 2.2 NT + Copper Dropwire
        df.loc[(df['GroupConcession'] == 'NT') &
               (df['Line_Type'] == 'เส้นทองแดง(Dropwire)'), 'Group'] = '2.2'

        # 4.1 สัมปทานต่างๆ
        df.loc[(df['Concession'] == 'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)') &
               (df['Line_Type'] != 'เส้นใยแก้วนำแสง(Fig.8)') &
               (df['Cores'].isin([12, 24])), 'Group'] = '4.1'

        # 5.1 NT เดิม
        df.loc[(df['Concession'].isin(['-', 'บริษัท ทีโอที จำกัด(มหาชน)'])) &
               (df['Line_Type'].isin(['เส้นใยแก้วนำแสง(Fig.8)', 'เส้นใยแก้วนำแสง(ADSS)', 'เส้นใยแก้วนำแสง(ARSS)'])) &
               (df['Cores'].isin([12, 24, 48, 60, 120])), 'Group'] = '5.1'

        # 6.2 พิเศษ
        df.loc[(df['Line_Type'].isin(['เส้นทองแดง(Dropwire)','เส้นใยแก้วนำแสง(dropwire)','เส้นใยแก้วนำแสง(Fig.8)'])) &
               (~df['Cores'].isin([1, 2])), 'Group'] = '6.2'

        # ค่าที่เหลือให้เป็น 3.0
        df['Group'] = df['Group'].fillna('3.0')

        # --- 4. บันทึกไฟล์ ---
        random_prefix = str(random.randint(1000, 9999))
        output_name = f"{random_prefix}_Processed_{file_rd05}"

        df.to_excel(output_name, index=False)
        print(f'✅ บันทึกไฟล์สำเร็จ: {output_name}')

        # ดาวน์โหลดไฟล์กลับลงเครื่องคอมพิวเตอร์อัตโนมัติ
        files.download(output_name)

    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")

# --- ส่วนเริ่มทำงาน ---
file_name, file_path = get_file_path_colab()
if file_name:
    Group_Select(file_name)
else:
    print("ยกเลิกการทำงาน")