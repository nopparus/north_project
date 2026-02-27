import pandas as pd
import locale
import random
import tkinter as tk
import os
import xlsxwriter

def get_file_path():
  file_name = ""
  file_path = ""
  while True:
    file_name = input("กรุณาระบุชื่อไฟล์: ")
    if os.path.isfile(file_name):
      file_path = os.path.abspath(file_name)
      break
    else:
      print(f"ไฟล์ '{file_name}' ไม่พบในไดเรกทอรีปัจจุบัน")
      cancel = input("ต้องการยกเลิก (กด Enter) หรือลองชื่อไฟล์ใหม่ (กดปุ่มอื่น ๆ)?: ")
      if cancel.lower() == "":
        return None, None
      else:
        continue

  return file_name, file_path

def Group_Select():
    df = pd.read_excel(file_rd03, skiprows=8, header=None, index_col=0)
    df.sample(2)
    if 21 in df.columns:
        df.drop(21,axis=1,inplace=True)
        print("ลบ Column วันที่แก้ไข แล้ว")
    else:
        print("ไม่มี Column วันที่แก้ไข")
    df.columns = ["PEA", "Route_Name", "Tag", "Owner", "Concession",
                  "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
                  "Total_Distance", "Distance_in_Area", "Installation", "Notes",
                  "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
                  "Data_Source", "Username", "Name_Lastname"]
    print('สร้างหัวตารางเรียบร้อยแล้ว')
    #df.sample(2)
    ## สร้าง Column ['GroupConcession'] เพื่อจัดกลุ่ม และ ['Group'] เพื่อใช้แยกประเภท
    df['GroupConcession'] = pd.NA
    df['Group'] = pd.NA
    print('สร้าง GroupConcession,Group เรียบร้อยแล้ว')
    #นำแถวว่าง ออกจากข้อมูล โดยดูจาก PEA
    df.dropna(subset=['PEA'], inplace=True)

    #จัดเก็บค่า Line Type, Cores, Diameter, Concession ไว้ตรวจสอบ
    # ดึงค่า unique จาก 'Line_Type'
    unique_values = df['Line_Type'].unique()
    df_Line_Type = pd.DataFrame(unique_values, columns=['Line_Type'])
    df_Line_Type = df_Line_Type.sort_values(by='Line_Type', ascending=True)
    df_Line_Type.reset_index(drop=True, inplace=True)
    #df_Line_Type.to_excel('data.xlsx', sheet_name='Line_Type')
    #df_Line_Type.info()
    # ดึงค่า unique จาก 'Cores'
    unique_values = df['Cores'].unique()
    df_Cores = pd.DataFrame(unique_values, columns=['Cores'])
    df_Cores = df_Cores.sort_values(by='Cores', ascending=True)
    df_Cores.reset_index(drop=True, inplace=True)
    #df_Cores.to_excel('data.xlsx', sheet_name='Cores')
    #df_Cores.info()
    # ดึงค่า unique จาก 'Diameter'
    unique_values = df['Diameter'].unique()
    df_Diameter = pd.DataFrame(unique_values, columns=['Diameter'])
    df_Diameter = df_Diameter.sort_values(by='Diameter', ascending=True)
    df_Diameter.reset_index(drop=True, inplace=True)
    #df_Diameter.to_excel('data.xlsx', sheet_name='Diameter')
    #df_Diameter.info()
    # ดึงค่า unique จาก 'Concession'
    unique_values = df['Concession'].unique()
    df_Concession = pd.DataFrame(unique_values, columns=['Concession'])
    df_Concession = df_Concession.sort_values(by='Concession', ascending=True)
    df_Concession.reset_index(drop=True, inplace=True)
    #df_Concession.to_excel('data.xlsx', sheet_name='Concession')
    #df_Concession.info()
    with pd.ExcelWriter('data.xlsx') as writer:
        df_Line_Type.to_excel(writer, sheet_name='Line_Type')
        df_Cores.to_excel(writer, sheet_name='Cores')
        df_Diameter.to_excel(writer, sheet_name='Diameter')
        df_Concession.to_excel(writer, sheet_name='Concession')

    ## จัดกลุ่ม
    # 1. กระทรวงดิจิทัล
    # 2. กสทช
    # 3. NT
    # 4. สัมปทาน NT
    # 5. ไม่ใช่สัมปทาน NT
    #แยกกลุ่ม กระทรวจดิจิทัล
    df_filter = df.query("Concession == ['กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม', 'กระทรวงดิจิทัลเศรษฐกิจและสังคมตรวจสอบเส้นทางแล้ว']")
    df_filter = df_filter.assign(GroupConcession='กระทรวจดิจิทัล')
    df.update({ 'GroupConcession': df_filter['GroupConcession'] })
    #df['GroupConcession'].update(df_filter['GroupConcession'])
    print('แยกกลุ่ม กระทรวจดิจิทัล')
    #df_filter.shape
    #แยกกลุ่ม กสทช
    df_filter = df.query("Concession == ['NBTC/CAT', 'NBTC/TOT']")
    df_filter = df_filter.assign(GroupConcession='กสทช')
    df.update({ 'GroupConcession': df_filter['GroupConcession'] })
    print('แยกกลุ่ม กสทช')
    #df_filter.shape
    #แยกกลุ่ม NT
    df_filter = df.query("Concession == ['-', 'บริษัท กสท โทรคมนาคม จำกัด(มหาชน)', 'บริษัท ทีโอที จำกัด(มหาชน)', 'ย้ายข้อมูลจากTAMS1', 'Cleansing ข้อมูลสายสื่อสาร', 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)']")
    df_filter = df_filter.assign(GroupConcession='NT')
    df.update({ 'GroupConcession': df_filter['GroupConcession'] })
    print('แยกกลุ่ม NT')
    #df_filter.shape
    #แยกกลุ่ม สัมปทาน NT
    df_filter = df.query("Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน', 'TOT/AIS #สัมปทาน', 'TOT-TT&T #สัมปทาน', 'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'บริษัท บีเอฟเคที จำกัด']")
    df_filter = df_filter.assign(GroupConcession='สัมปทาน NT')
    df.update({ 'GroupConcession': df_filter['GroupConcession'] })
    print('แยกกลุ่ม สัมปทาน NT')
    #df_filter.shape
    #แยกกลุ่ม ไม่ใช่สัมปทาน NT
    df_filter = df.query("Concession == ['Big Patrol', 'CAT-SINET #สัมปทาน', 'CAT-TRUE #สัมปทาน', 'เคเบิ้ลทีวี (รวม)', 'บริษัท เอแอลที เทเลคอม จำกัด (มหาชน)', 'บริษัท แอดวานซ์ ไวร์เลส เน็ทเวอร์ค จำกัด', 'บริษัท ไซแมท เทคโนโลยี จำกัด (มหาชน)', 'บริษัท ดีแทค ไตรเน็ต จำกัด', 'บริษัท ทริปเปิลที บรอดแบนด์ จำกัด (มหาชน)', 'บริษัท ทริปเปิลที อินเทอร์เน็ต จำกัด', 'บริษัท ทรู มูฟ เอช ยูนิเวอร์แซล คอมมิวนิเคชั่น จำกัด', 'บริษัท ทรู มูฟ จำกัด (มหาชน)', 'บริษัท ทรู อินเทอร์เน็ต คอร์ปอเรชั่น จำกัด', 'บริษัท พีทีที  ไอซีที โซลูชั่น จำกัด', 'บริษัท ยูไนเต็ด อินฟอร์เมชั่น ไฮเวย์ จำกัด', 'บริษัท อินเตอร์ลิ้งค์ เทเลคอม จำกัด (มหาชน)', 'บริษัท ฮัทชิสัน ซีเอที ไวร์เลส มัลติมีเดีย จำกัด', 'สำนักงานบริหารเทคโนโลยีสารสนเทศเพื่อพัฒนาการศึกษา (สกอ.)']")
    df_filter = df_filter.assign(GroupConcession='ไม่ใช่สัมปทาน NT')
    df.update({ 'GroupConcession': df_filter['GroupConcession'] })
    print('แยกกลุ่ม ไม่ใช่สัมปทาน NT')
    #df_filter.shape
    #df.info()

    # ตรวจสอบและจัดกลุ่ม
    ### โดยแยกข้อมูลเป็นประเภทแล้วเก็บไว้ที่ Coloum "Group"
    # Clear ข้อมูลใน Column 'Group'
    df['Group'] = pd.NA
    df_select = df[['Concession', 'Group']]
    df_select.info()

    ## Group 1
    #1.1	หน่วยงาน = 'กระทรวจดิจิทัล'
    df_filter = df.query("GroupConcession == 'กระทรวจดิจิทัล'")
    df_filter = df_filter.assign(Group='1.1')
    df.update({ 'Group': df_filter['Group'] })

    #1.2	หน่วยงาน = 'กสทช'
    df_filter = df.query("GroupConcession == ['กสทช']")
    df_filter = df_filter.assign(Group='1.2')
    df.update({ 'Group': df_filter['Group'] })

    #1.3	หน่วยงานทั้งหมด =  และ (Line_Type == 'เส้นทองแดง(Coaxial)')
    df_filter = df.query("(Line_Type == 'เส้นทองแดง(Coaxial)')")
    df_filter = df_filter.assign(Group='1.3')
    df.update({ 'Group': df_filter['Group'] })

    #1.4	หน่วยงานใต้สัมปทาน = 'ไม่ใช่สัมปทาน NT'
    df_filter = df.query("(GroupConcession == ['ไม่ใช่สัมปทาน NT']) or (Concession == ['บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน', 'TOT/AIS #สัมปทาน', 'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)' ,'บริษัท บีเอฟเคที จำกัด']) & (Line_Type == ['เส้นทองแดง(CU)', 'เส้นทองแดง(Dropwire)'])")
    df_filter = df_filter.assign(Group='1.4')
    df_filter1 = df.query("(GroupConcession == ['สัมปทาน NT']) & ~(Concession == ['CAT-TAC #สัมปทาน', 'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)']) & (Line_Type == ['เส้นใยแก้วนำแสง(ADSS)', 'เส้นใยแก้วนำแสง(ARSS)', 'เส้นใยแก้วนำแสง(dropwire)'])")
    df_filter1 = df_filter1.assign(Group='1.4')
    df_filter2 = df.query("(Concession == ['CAT-TAC #สัมปทาน', 'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)']) & (Line_Type == ['เส้นใยแก้วนำแสง(ARSS)', 'เส้นใยแก้วนำแสง(dropwire)'])")
    df_filter2 = df_filter2.assign(Group='1.4')
    df.update({ 'Group': df_filter['Group'] })
    df.update({ 'Group': df_filter1['Group'] })
    df.update({ 'Group': df_filter2['Group'] })

    ## Group 2
    #2.1.2	ประเภทสาย = 'เส้นทองแดง(Dropwire)'
    df_filter = df.query("(GroupConcession == ['NT'] or (Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน'])) & (Line_Type == 'เส้นทองแดง(Dropwire)')")
    df_filter = df_filter.assign(Group='2.1.2')
    df.update({ 'Group': df_filter['Group'] })

    #2.2.1	ประเภทสาย = 'เส้นใยแก้วนำแสง(dropwire)' และ เส้นผ่านศูนย์กลาง(มม.) = ‘5-8 mm.’ และ จำนวน Core = 1-2 และ 0 < ระยะทาง(กม.) = <= 500 m.
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(dropwire)') & (5 <= Diameter <= 8) & (Cores == [1, 2]) & (0 < Total_Distance <= 0.5)")
    df_filter = df_filter.assign(Group='2.2.1')
    df.update({ 'Group': df_filter['Group'] })

    #2.2.3	ประเภทสาย = 'เส้นใยแก้วนำแสง(dropwire)' และ จำนวน Core = 1-2 และ ระยะทาง(กม.) > 500 m.
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(dropwire)') & (Cores == [1, 2]) & (Total_Distance > 0.5)")
    df_filter = df_filter.assign(Group='2.2.3')
    #2.2.3	ประเภทสาย = 'เส้นใยแก้วนำแสง(dropwire)' และ จำนวน Core = 1-2 และ เส้นผ่าศูนย์กลางไม่ใช่ 5-8 และ ระยะทาง(กม.) != 0 m.
    df_filter1 = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(dropwire)') & (Cores == [1, 2]) & ~(5 <= Diameter <= 8)& (Total_Distance != 0)")
    df_filter1 = df_filter1.assign(Group='2.2.3')
    df.update({ 'Group': df_filter['Group'] })
    df.update({ 'Group': df_filter1['Group'] })

    #2.2.4	ประเภทสาย = 'เส้นใยแก้วนำแสง(dropwire)' และ จำนวน Core != 1-2 และ ระยะทาง(กม.) == 0 m.
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(dropwire)') & (~(Cores == [1, 2]) or (Total_Distance == 0))")
    df_filter = df_filter.assign(Group='2.2.4')
    df.update({ 'Group': df_filter['Group'] })

    # Group 3
    #3.1.2	กลุ่ม == ['NT']+TT&T และ ประเภทสาย = 'เส้นทองแดง(CU)'
    df_filter = df.query("((GroupConcession == ['NT']) or (Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน'])) & (Line_Type == 'เส้นทองแดง(CU)')")
    df_filter = df_filter.assign(Group='3.1.2')
    df.update({ 'Group': df_filter['Group'] })

    # Group 4
    #4.1.1 กลุ่ม == ['NT'] และ OFC(Fig.8) 12F, 24F และ Ø = 18-20 mm หรือ OFC(Fig.8) 48F, 60F และ Ø = 20-22 mm หรือ OFC(Fig.8) 120F และ Ø = 24-27 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)' & (Cores == [12, 24] & 18 <= Diameter <= 20) or (Cores == [48, 60] & 20 <= Diameter <= 22) or (Cores == 120 & 24 <= Diameter <= 27))")
    df_filter = df_filter.assign(Group='4.1.1')
    df.update({ 'Group': df_filter['Group'] })

    #4.1.3 กลุ่ม == ['NT'] และ OFC(Fig.8) 12F, 24F และ Ø != 18-20 mm หรือ OFC(Fig.8) 48F, 60F และ Ø != 20-22 mm หรือ OFC(Fig.8) 120F และ Ø != 24-27 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)' & (Cores == [12, 24] & ~(18 <= Diameter <= 20)) or (Cores == [48, 60] & ~(20 <= Diameter <= 22)) or (Cores == 120 & ~(24 <= Diameter <= 27)))")
    df_filter = df_filter.assign(Group='4.1.3')
    df.update({ 'Group': df_filter['Group'] })

    #4.1.4 กลุ่ม == ['NT'] และ OFC(Fig.8) != 12F, 24F,  48F,  120F
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)' & (Cores != [12, 24, 48, 60, 120]))")
    df_filter = df_filter.assign(Group='4.1.4')
    df.update({ 'Group': df_filter['Group'] })

    #4.2.1 กลุ่ม == ['NT'] และ เส้นใยแก้วนำแสง(ADSS) 12F, 24F, 48F, 60F และ Ø = 10-12 mm หรือ เส้นใยแก้วนำแสง(ADSS) 120F และ Ø = 15-17 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores == [12, 24, 48, 60] & (10 <= Diameter <= 12)) or (Cores == 120 & (15 <= Diameter <= 17)))")
    df_filter = df_filter.assign(Group='4.2.1')
    df.update({ 'Group': df_filter['Group'] })

    #4.2.3 กลุ่ม == ['NT'] และ เส้นใยแก้วนำแสง(ADSS) 12F, 24F, 48F, 60F และ Ø != 10-12 mm หรือ เส้นใยแก้วนำแสง(ADSS) 120F และ Ø != 15-17 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores == [12, 24, 48, 60] & ~(10 <= Diameter <= 12)) or (Cores == 120 & ~(15 <= Diameter <= 17)))")
    df_filter = df_filter.assign(Group='4.2.3')
    df.update({ 'Group': df_filter['Group'] })

    #4.2.4 กลุ่ม == ['NT'] และ 'เส้นใยแก้วนำแสง(ADSS)' != 12F, 24F, 48F, 60F, 120F
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores != [12, 24, 48, 60, 120]))")
    df_filter = df_filter.assign(Group='4.2.4')
    df.update({ 'Group': df_filter['Group'] })

    #4.3.1 กลุ่ม == ['NT'] และ เส้นใยแก้วนำแสง(ARSS) 12F, 24F, 48F, 60F และ Ø = 10-12 mm หรือ เส้นใยแก้วนำแสง(ARSS) 120F และ Ø = 15-17 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ARSS)') & ((Cores == [12, 24, 48, 60] & (10 <= Diameter <= 12)) or (Cores == 120 & (15 <= Diameter <= 17)))")
    df_filter = df_filter.assign(Group='4.3.1')
    df.update({ 'Group': df_filter['Group'] })

    #4.3.3 กลุ่ม == ['NT'] และ เส้นใยแก้วนำแสง(ARSS) 12F, 24F, 48F, 60F และ Ø != 10-12 mm หรือ เส้นใยแก้วนำแสง(ARSS) 120F และ Ø != 15-17 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ARSS)') & ((Cores == [12, 24, 48, 60] & ~(10 <= Diameter <= 12)) or (Cores == 120 & ~(15 <= Diameter <= 17)))")
    df_filter = df_filter.assign(Group='4.3.3')
    df.update({ 'Group': df_filter['Group'] })

    #4.3.4 กลุ่ม == ['NT'] และ 'เส้นใยแก้วนำแสง(ARSS)' != 12F, 24F, 48F, 60F, 120F
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == 'เส้นใยแก้วนำแสง(ARSS)') & ((Cores != [12, 24, 48, 60, 120]))")
    df_filter = df_filter.assign(Group='4.3.4')
    df.update({ 'Group': df_filter['Group'] })

    #4.4.1 Concession == 'บริษัท กสท โทรคมนาคม จำกัด(มหาชน)' และ ‘เส้นใยแก้วนำแสง(Fig.8)’, 'เส้นใยแก้วนำแสง(dropwire)' Core 12F และ Ø = 10-13 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == ['เส้นใยแก้วนำแสง(Fig.8)', 'เส้นใยแก้วนำแสง(dropwire)']) & ((Cores == [12] & (10 <= Diameter <= 13)))")
    df_filter = df_filter.assign(Group='4.4.1')
    df.update({ 'Group': df_filter['Group'] })

    #4.4.3 Concession == 'บริษัท กสท โทรคมนาคม จำกัด(มหาชน)' และ ‘เส้นใยแก้วนำแสง(Fig.8)’, 'เส้นใยแก้วนำแสง(dropwire)' Core 12F และ Ø != 10-13 mm
    df_filter = df.query("(GroupConcession == ['NT']) & (Line_Type == ['เส้นใยแก้วนำแสง(Fig.8)', 'เส้นใยแก้วนำแสง(dropwire)']) & ((Cores == [12] & ~(10 <= Diameter <= 13)))")
    df_filter = df_filter.assign(Group='4.4.3')
    df.update({ 'Group': df_filter['Group'] })

    ### บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)
    #5.1.1  'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน' , และ เส้นใยแก้วนำแสง(Fig.8) Core 12F, 24F และ Ø = 18-20 mm
    df_filter = df.query("(Concession == ['บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & (Cores == [12, 24] & (18 <= Diameter <= 20))")
    df_filter = df_filter.assign(Group='5.1.1')
    df.update({ 'Group': df_filter['Group'] })

    #5.1.3  'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน' , และ เส้นใยแก้วนำแสง(Fig.8) Core 12F, 24F และ Ø != 18-20 mm
    df_filter = df.query("(Concession == ['บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & (Cores == [12, 24] & ~(18 <= Diameter <= 20))")
    df_filter = df_filter.assign(Group='5.1.3')
    df.update({ 'Group': df_filter['Group'] })

    #5.1.4  'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน' , และ เส้นใยแก้วนำแสง(Fig.8) Core 12F, 24F และ Ø != 18-20 mm
    df_filter = df.query("(Concession == ['บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)','TOT/AIS #สัมปทาน']) & ((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & (Cores != [12, 24]) or (Line_Type != 'เส้นใยแก้วนำแสง(Fig.8)'))")
    df_filter = df_filter.assign(Group='5.1.4')
    df.update({ 'Group': df_filter['Group'] })

    ### บริษัท ทีทีแอนด์ที จำกัด (มหาชน)
    #5.2.1  'บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน'  และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø = 18-20 mm  และ Core 48F และ Ø = 20-22 mm
    df_filter = df.query("(Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & (18 <= Diameter <= 20)) or (Cores == 48 & (20 <= Diameter <= 22)))")
    df_filter = df_filter.assign(Group='5.2.1')
    df.update({ 'Group': df_filter['Group'] })

    #5.2.3  'บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน'  และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø != 18-20 mm  และ Core 48F และ Ø != 20-22 mm
    df_filter = df.query("(Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & ~(18 <= Diameter <= 20)) or (Cores == 48 & ~(20 <= Diameter <= 22)))")
    df_filter = df_filter.assign(Group='5.2.3')
    df.update({ 'Group': df_filter['Group'] })

    #5.2.4  'บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน'  และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core != 12F, 24F, 48F
    df_filter = df.query("(Concession == ['บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'TOT-TT&T #สัมปทาน']) & ((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores != [12, 24, 48])) or (Line_Type == ['เส้นใยแก้วนำแสง(ARSS)', 'เส้นใยแก้วนำแสง(ADSS)']))")
    df_filter = df_filter.assign(Group='5.2.4')
    df.update({ 'Group': df_filter['Group'] })

    ### บริษัท บีเอฟเคที จำกัด
    #5.3.1  'บริษัท บีเอฟเคที จำกัด' และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø = 18-20 mm  และ Core 48F และ Ø = 20-22 mm
    df_filter = df.query("(Concession == ['บริษัท บีเอฟเคที จำกัด']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & (18 <= Diameter <= 20)) or (Cores == 48 & (20 <= Diameter <= 22)))")
    df_filter = df_filter.assign(Group='5.3.1')
    df.update({ 'Group': df_filter['Group'] })

    #5.3.3  'บริษัท บีเอฟเคที จำกัด'  และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø != 18-20 mm  และ Core 48F และ Ø != 20-22 mm
    df_filter = df.query("(Concession == ['บริษัท บีเอฟเคที จำกัด']) & (Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & ~(18 <= Diameter <= 20)) or (Cores == 48 & ~(20 <= Diameter <= 22)))")
    df_filter = df_filter.assign(Group='5.3.3')
    df.update({ 'Group': df_filter['Group'] })

    #5.3.4  'บริษัท บีเอฟเคที จำกัด'  และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core != 12F, 24F, 48F
    df_filter = df.query("(Concession == ['บริษัท บีเอฟเคที จำกัด']) & ((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores != [12, 24, 48])) or (Line_Type == ['เส้นใยแก้วนำแสง(ARSS)', 'เส้นใยแก้วนำแสง(ADSS)']))")
    df_filter = df_filter.assign(Group='5.3.4')
    df.update({ 'Group': df_filter['Group'] })

    ### 'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน'
    #5.4.1  'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน' และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø = 18-20 mm or 'เส้นใยแก้วนำแสง(ADSS)' Core 12F, 24F และ Ø = 10-12 mm
    df_filter = df.query("(Concession == ['บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน']) & (((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & (18 <= Diameter <= 20)))) or ((Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores == [12, 24] & (10 <= Diameter <= 12)))))")
    df_filter = df_filter.assign(Group='5.4.1')
    df.update({ 'Group': df_filter['Group'] })

    #5.4.3  'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน' และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core 12F, 24F และ Ø = 18-20 mm or 'เส้นใยแก้วนำแสง(ADSS)' Core 12F, 24F และ Ø = 10-12 mm
    df_filter = df.query("(Concession == ['บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน']) & (((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores == [12, 24] & ~(18 <= Diameter <= 20)))) or ((Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores == [12, 24] & ~(10 <= Diameter <= 12)))))")
    df_filter = df_filter.assign(Group='5.4.3')
    df.update({ 'Group': df_filter['Group'] })

    #5.4.4  'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน' และ 'เส้นใยแก้วนำแสง(Fig.8)' และ Core != 12F, 24F  or 'เส้นใยแก้วนำแสง(ADSS)' Core != 12F, 24F or  != 'เส้นใยแก้วนำแสง(Fig.8)','เส้นใยแก้วนำแสง(ADSS)'
    df_filter = df.query("(Concession == ['บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'CAT-TAC #สัมปทาน']) & (((Line_Type == 'เส้นใยแก้วนำแสง(Fig.8)') & ((Cores != [12, 24]))) or ((Line_Type == 'เส้นใยแก้วนำแสง(ADSS)') & ((Cores != [12, 24]))) or (Line_Type != ['เส้นใยแก้วนำแสง(Fig.8)', 'เส้นใยแก้วนำแสง(ADSS)']))")
    df_filter = df_filter.assign(Group='5.4.4')
    df.update({ 'Group': df_filter['Group'] })

    # แสดงตารางที่จัดเก็บ
    df_select = df[['Concession', 'Group']]
    df_select.info()
    #df.sample(2)

    #save files to Newfile random counter
    file_rd03_new = (str(random.randint(0, 9999)) + "_" + file_rd03)
    print('กำลังบันทึกไฟล์ Excel')
    df.to_excel(file_rd03_new, index=False)
    print('บันทึกไฟล์ Excel สำเร็จ : '+file_rd03_new)

# Start
file_name, file_path = get_file_path()
if file_name is not None:
  print(f"ชื่อไฟล์: {file_name}")
  file_rd03 = file_name
  Group_Select()
else:
  print("ผู้ใช้ยกเลิกการป้อนชื่อไฟล์")