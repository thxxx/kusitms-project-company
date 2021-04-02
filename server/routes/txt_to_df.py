import pandas as pd
import numpy as np
from eunjeon import Mecab
from nltk import FreqDist
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import time
import matplotlib as mpl
mpl.rcParams['font.size'] = 9.0
global filenames
filenames=[]

def file_input(*file):
    '''
    카카오톡 대화 내용 파일을 입력 받고,
    내보내기 매체(PC/MOBILE)를 구분하고 각 라인을 읽어서 만든 리스트를 반환

    :return: str, list
    '''
    #print(file)
    while True:
        if len(file[0])!=0: #ML dataset 생성용
            filename=list((list(file))[0])[0]
            print(filename)
        else:
            filename = input("카카오톡 대화 파일을 입력해주세요.(예: kakaotalk.txt): ")
        if not (filename.endswith(".txt")):
            print("txt파일만 입력가능합니다.\n다시 입력해주세요.")
        else:
            f = open(filename, 'r', encoding='UTF-8')
            lines = f.readlines()
            ##########
            chat_data_start_index=find_when_start(lines)
            chat_text_ver=decide_version(lines)
            if chat_text_ver==None:
                print("유효한 파일 포맷이 아닙니다.\n다시 입력해주세요.")
            else:
                return chat_text_ver, lines[chat_data_start_index:]
                break
def is_right_file(lines):
    first_line=lines[0][1:].rstrip()
    if first_line.endswith("님과 카카오톡 대화") or first_line.startswith("Talk_") and first_line.endswith(".txt"):
        return True
    else:
        return False

def decide_version(lines):
    '''
    첫 줄을 보고 채팅 파일 포맷을 결정
    :param lines: (list) txt파일 lines
    :return: (str) ver 정보
    '''
    # 개행문자 제외,,처음 날짜 언제 나오는지 확인(카톡 버전마다 다른듯함)

    chat_data_start = lines[find_when_start(lines)]
    #print("chat_data_start: ", chat_data_start)
    if chat_data_start.startswith("---------------") and chat_data_start.endswith("요일 ---------------\n"):  # ver1, PC
        version = "VER1"
    elif chat_data_start.find("년")>0:
        version = "VER2"
    else:
        version = None
    return version

def find_when_start(lines):
    '''
    제일 처음 날짜 포맷 나오는 line의 index 찾기

        (list) => (int)
    '''
    first_ten_lines = lines[:10]
    deleted_newline_list = delete_newline(first_ten_lines)
    blank = False
    for item in deleted_newline_list:
        if item == '':
            blank = True
        elif item != '' and blank:
            chat_data_start_index = deleted_newline_list.index(item)
            break
    #chat_data_start = item

    return chat_data_start_index

def delete_newline(lines):
    '''

    :param lines: list(txt파일의 각 줄로 구성된 리스트)
    :return: list(각 줄의 제일 끝 개행 문자를 제거한 리스트)
    '''
    chatting=[]
    for item in lines: #제일 끝 개행문자 제외하고 한 줄씩 chatting 리스트에 추가
        chatting.append(item[:-1])
    return chatting
def is_right_date_format_ver1(year, month, date, am_or_pm, time):
    '''
    :param year:
    :param month:
    :param date:
    :param am_or_pm:
    :param time:
    :return: bool (PC 내보내기 파일의 채팅  date 포맷에 부합하면 1, 아니면 0 반환)
    '''
    if year.isdigit() and month.isdigit() and date.isdigit() and (am_or_pm in ['오전', '오후']) and time.split(':')[
        0].isdigit():
        if (2000 <= int(year)) and (int(month) < 13) and (int(date) < 32) and (int(time.split(':')[0]) < 13):
            return True
        else:
            return False
    else:
        return False
def is_right_date_format_ver2(name, am_or_pm, time):
    '''
    :param name:
    :param am_or_pm:
    :param time:
    :return: bool (MOBILE 내보내기 파일의 채팅 포맷에 부합하면 1, 아니면 0 반환)
    '''
    if len(name) > 0 and (am_or_pm in ['오전', '오후']) and time.split(':')[0].isdigit():
        if int(time.split(":")[0]) < 13:
            return True
        else:
            return False
    else:
        return False
def is_right_date_format(day):
    '''
    날짜 바뀔 시점의 line
    예) 2021년 1월 12일 오후 2:19
    :param day: str
    :return: bool (day가 카카오톡 채팅 파일의 날짜 포맷과 일치하면 1, 아니면 0 반환)
    '''
    if len(day) >= 3 and len(day) != 0 and day[0].find('년') > 0 and day[1].find("월") > 0 and day[2].find("일") > 0:
        return True
    else:
        return False
def count_only_letters(content):
    '''
    :param content: str
    :return: int (" "(공백)과 "이모티콘"을 제외한 문자열의 길이 반환)
    '''
    modified_content = content.replace(" ", "")  # content의 공백제거
    emoticon_count = content.count("이모티콘")
    content_length = len(modified_content) - 3 * emoticon_count  # 이모티콘은 글자 하나로 쳐준다
    return content_length
def text_ver2(chat_by_lines):
    #참여자, 하나의 채팅=> dictionary로 바꾼 리스트 반환
    '''
    mobile에서 내보내기 한 파일의 각 line을 분석.

    :param chat_by_lines:
    :return: list, list (the list of the participants, collection(list) of the dictionary form of each line)
    '''

    '''
    2019년 9월 20일 금요일
    2019. 9. 20. 오후 3:27: 박민영님이 이수빈님, 이서현님과 오경제님을 초대했습니다.
    2019. 9. 20. 오후 3:27, 박민영 : .'''
    '''
    2020년 12월 1일 오전 1:37
    2020년 12월 1일 오전 1:37, 김호진 : 조모임 게시판에 파트 분배 관련된 사항으로 글을 올릴까요?? 아니면 조장님이 쓰시는게 제일 깔끔할라나요
    2020년 12월 1일 오전 1:40, 천승환 : 제가 오늘 밤에 쓰겠습니다!'''
    chat_format = []
    data = []
    # days=[]
    participants = []
    day_count = 0
    ignore_lines = ["님을 초대했습니다.", "님을 초대하였습니다.", "님이 나갔습니다.","님이 들어왔습니다.", "운영정책을 위반한 메시지로 신고 접수 시 카카오톡 이용에 제한이 있을 수 있습니다."]
    for item in chat_by_lines:
        if item.find(",") == -1:  # 날 바뀔 시점(ver1,ver2 형태 안 같음..)
            date = item.split()
            if is_right_date_format(date):
                day_count += 1

        else:  # 일반 채팅
            ignore_this_line=False
            for ignore_line in ignore_lines:# 채팅방 처음 시작할 때 걸러야함
                if item.find(ignore_line)!=-1:
                    ignore_this_line = True
                    break

            if not ignore_this_line: #걸러야할 문자열이 없을 때
                chat_format = (item.split()[:6] if len(item.split()) > 0 else None)
                if len(chat_format) == 6:
                    if chat_format[0].endswith("."):
                        year = chat_format[0].split('.')[0]
                        month = chat_format[1].split('.')[0]
                        day = chat_format[2].split('.')[0]

                    elif chat_format[0].endswith("년"):
                        year = chat_format[0].split('년')[0]
                        month = chat_format[1].split('월')[0]
                        day = chat_format[2].split('일')[0]

                    am_or_pm = chat_format[3]
                    time = chat_format[4].split(',')[0]

                    # chat format 조건에 부합하는지 검사
                    if is_right_date_format_ver1(year, month, day, am_or_pm, time):
                        name_and_content = item.split(',')[1].split(' : ')
                        name = name_and_content[0].strip() #.split()[0]
                        if name not in participants:
                            participants.append(name)
                        if int(month) < 10:
                            month = '0' + month
                        if int(day) < 10:
                            day = '0' + day

                        hour = int(time.split(":")[0])
                        if am_or_pm == "오후":
                            hour = hour + 12

                        new_time = str(hour) + ":" + time.split(":")[1][:2]

                        new_date = year + "년 " + month + "월 " + day + "일"

                        idx = item.find(":", 20)
                        content = ''.join(item[idx + 2:])
                        ################meaningful word!!!!!!!!
                        content=filter_meaningful_words(content)
                        content_length = count_only_letters(content)
                        data.append({"Name": name, "Date": new_date, "Time": new_time, "Content": content,
                                     "Length": content_length})

                    else:  # 해당 line이 채팅 시작 줄이 아니라 긴 채팅 중 한 line일때
                        value_len = len(data)
                        data[value_len - 1]["Content"] = data[value_len - 1]["Content"] + item
    return participants, data
def text_ver1(chat_by_lines):  #참여자, 하나의 채팅=> dictionary로 바꾼 리스트 반환
    chat_format = []
    data = []
    participants = []
    day_count = 0

    for item in chat_by_lines:
        if item.startswith("---------------") and item.endswith("요일 ---------------"):  # 날 바뀔 시점
            date = item.strip("---------------").split(" ")[1:-1]
            # print(date)
            if is_right_date_format(date):
                year = date[0][:-1]
                month = date[1][:-1]
                day = date[2][:-1]
                day_count += 1

        else:  # 일반 채팅
            if item.find("님을 초대했습니다.") != -1 or item.find("님을 초대하였습니다.") != -1:  # 채팅방 처음 시작할 때 걸러야함
                continue
            if item.startswith("[")and item.count("[") >= 2 and item.count("]") >= 2 and item.find("[",1)==item.find("]")+2:
                start = item.find('[')
                end = item.find(']')

                if start == -1 or end == -1:
                    print("ㅁㅁㅁ format이 없습니다.")
                    break
                name = item[start + 1:end]
                if name not in participants:
                    participants.append(name)
                start = item.find('[', end + 2)
                end = item.find(']', end + 2)
                if start == -1 or end == -1:
                    print("O:OO format이 없습니다.")
                    break
                am_or_pm_and_time = item[start + 1:end]

                am_or_pm = am_or_pm_and_time.split()[0]
                time = am_or_pm_and_time.split()[1]
                if is_right_date_format_ver2(name, am_or_pm, time):

                    idx = item.find("]", 5)  # 마지막 ']'의 인덱스
                    content = ''.join(item[idx + 2:])
                    content = filter_meaningful_words(content)
                    content_length = count_only_letters(content)

                    new_date = year + "년 " + month + "월 " + day + "일"
                    data.append(
                        {"Name": name, "Date": new_date, "Time": time, "Content": content, "Length": content_length})
                else:  # 해당 line이 채팅 시작 줄이 아니라 긴 채팅 중 한 line일때
                    value_len = len(data)
                    data[value_len - 1]["Content"] = data[value_len - 1]["Content"] + item
    return participants, data
def chat_data_extract(chat_text_from,chatting):
    '''
    대화 내용 리스트를
        {"Name":"OOO",
        "Date":"0000년 00월 00일",
        "Time":"00:00",
        "Content":"안녕하세요",
        "Length":5}
    포맷으로 나타낸 리스트 반환

    :param chat_text_from: "PC" or "MOBILE"
    :param chatting: chatting list
    :return: list, list of dictionaries (참여자, 각 채팅 포맷팅한 리스트)
    '''
    if chat_text_from == "VER1": #[박민영] [오후 4:00] 안녕하세요 #PC
        participants, data = text_ver1(chatting)

    elif chat_text_from == "VER2": #2021년 3월 31일 오후 4:00, 박민영: 안녕하세요 #Mobile
        participants, data = text_ver2(chatting)
    print("participants:", *participants)
    #print("data:", data[:5])
    return participants, data
def make_initial_df(data):
    '''

    :param data: list
    :return: pd.DataFrame
    '''
    chat_df = pd.DataFrame(columns=["Name", "Date", "Time", "Content", "Length"])
    for item in data:
        chat_df = chat_df.append(item, ignore_index=True)
    print("DataFrame created")
    return chat_df
def make_analysis_df(participants, chat_df):
    '''
    :param participants: list of participants
    :param chat_df: chat DataFrame
    :return: DataFrame with columns [Name, Count, Length]
    '''
    analysis_df = pd.DataFrame(columns=['Name', 'Count', 'Length'])

    for participant in participants:
        participant_df = chat_df[chat_df.Name == participant]
        count = len(participant_df)
        length = participant_df["Length"].sum()
        info = [participant, count, length]

        series = pd.Series(info, index=analysis_df.columns)
        analysis_df = analysis_df.append(series, ignore_index=True)


    keyword_count_df=make_keyword_df(participants,chat_df)
    analysis_df['Key'] = keyword_count_df['Count']

    print("analysis_df created")
    #print(analysis_df[:5])
    return(analysis_df)


def add_ratio_and_rank_key(User_name, sample_data, data10_list):  # 추출한 User Name 바탕으로 상위 키워드 언급한 횟수 찾기
    keyword_count_df = pd.DataFrame()
    for user in User_name:
        cnt_sum = 0
        for keyword in data10_list[0]:
            user_df = sample_data[sample_data['Name'] == user]
            user_message = user_df["Content"].str.count(keyword)
            count_sum = user_message.sum()
            cnt_sum += count_sum

        keyword_count_df = keyword_count_df.append([[user, cnt_sum]], ignore_index=True)

    keyword_count_df = keyword_count_df.rename(columns={0: 'Name', 1: 'Count'})

    print("keyword_count_df created")
    return (keyword_count_df)
def add_ratio_and_rank(analysis_df):
    '''
    :param analysis_df:
    :return: df에 ratio 및 rank column 추가
    '''
    count_sum = analysis_df["Count"].sum()
    length_sum = analysis_df["Length"].sum()
    key_sum = analysis_df["Key"].sum()

    analysis_df["Count Ratio"] = analysis_df["Count"] / count_sum * 100
    analysis_df["Length Ratio"] = analysis_df["Length"] / length_sum * 100
    analysis_df["Key Ratio"] = analysis_df["Key"] / length_sum * 100

    analysis_df["Count Rank"] = analysis_df["Count"].rank(ascending=False)
    analysis_df["Length Rank"] = analysis_df["Length"].rank(ascending=False)
    analysis_df["Key Rank"] = analysis_df["Key"].rank(ascending=False)
    pd.options.display.float_format = "{:,.2f}".format  # 소수점 둘째자리까지만 표시
    print("Ranks updated to analysis_df")
    #print(analysis_df[:5])
    return analysis_df
def make_file_extension_list(filesource):
    f_e_list = []
    with open(filesource, encoding="UTF-8") as f:
        x = f.readlines()
    f_e_list = x[0].strip(" ").split(" ")
    return f_e_list
def add_file_number(participants, chat_df,analysis_df, f_e_list):
    contains_file_list = []
    for participant in participants:
        participant_df = chat_df[chat_df["Name"] == participant]
        participant_c = participant_df["Content"]

        contains_file = participant_c[
            (participant_c.str.contains("파일: ")) & (participant_c.str.contains("|".join(f_e_list)))]

        contains_file_list.append(len(contains_file))

    analysis_df["File"] = contains_file_list
    file_sum = analysis_df["File"].sum()
    analysis_df["File Ratio"] = analysis_df["File"] / file_sum * 100
    print("Added info about file")
    #print(analysis_df)
    return analysis_df


def make_keyword_df(participants,chat_df):
    sample_data=make_sample_df(chat_df)
    data10_list = make_keyword(sample_data)
    keyword_count_df = add_ratio_and_rank_key(participants, sample_data, data10_list)
    return keyword_count_df

def make_df_for_ML(participants, chat_df):
    '''
    :param participants: 참여자 list
    :param chat_df: dataframe
    :return: dataframe
    '''
    analysis_df = make_analysis_df(participants, chat_df)


    file_extensions = make_file_extension_list("resource\\filename_extension_list.txt")
    analysis_df=add_file_number(participants, chat_df, analysis_df, file_extensions)
    analysis_df = add_ratio_and_rank(analysis_df)
    return analysis_df
def filter_participants(p_list,data):
    '''
    실제로 팀플에 참여한 사용자만 data에 포함시킴
    :param p_list: 단톡방에 있는 모든 참여자 list와 모든 참여자의 채팅 data
    :return: 실제 팀플 참여자 list와 실제 참여자의 채팅 data
    '''
    real_participants=[]
    not_real_participants=[]
    print("단체 채팅방에 있는 사용자들 중,({0})\n팀플에 실제로 참여한 사용자의 이름을 엔터로 구분하여 모두 입력하세요.\n입력이 끝나면 q를 눌러주세요.\n모든 사용자가 팀플 참여자인 경우 a를 입력해주세요\n".format(p_list))
    while True:
        #input_value=input("참여자 이름: ")

        input_value='a'
        if input_value=='q': break
        elif input_value=='a':
            real_participants=p_list
            break
        else:
            if input_value not in p_list:
                print("채팅방에 존재하는 이름이 아닙니다. 확인하고 다시 입력해주세요. ")
            else:
                real_participants.append(input_value)
        for user in real_participants:
            if user not in real_participants:
                not_real_participants.append(user)

        for item in data:
            if item["Name"] in not_real_participants:
                data.remove(item)
    return real_participants, data
def filter_meaningful_words(line):
    letters_to_remove="`~!@#$%^&*()_+=-[]{};'\",./<>?\|ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㄸㅃㅆㅉㄳㅄㄽㄻㄼㄺㅏㅑㅓㅕㅗㅛㅜㅠㅢㅘㅚㅙㅝㅞㅢㅐㅔㅟㅖㅒ]"
    new_string = line
    for letter in letters_to_remove:
        new_string=new_string.replace(letter,"")
    return new_string


def make_sample_df(chat_df):
    '''
    한글만 공백만 남긴 df반환
    :param chat_df: DataFrame
    :return: DataFrame
    '''
    sample_data = chat_df.copy()
    sample_data['Content'] = sample_data['Content'].str.replace("[^ㄱ-ㅎㅏ-ㅣ가-힣 ]", "",regex=True)

    return sample_data

def make_keyword(sample_data):
    '''
    :param sample_data: DataFrame
    :return: content column의 내용 토큰화-> 상위 10개 키워드 리스트 반환
    '''
    # 불용어 정의
    stopwords = ['어때','아하','어때요','니깐','니까','거든','을까','할까','거든요','많이','조금','습니당','습니다','입니다','니다','여러분','라도','만나','어디',
                 '이렇게','저렇게','은데','한데','응','아직','응응','그래','오키','든요','어떻게','왜','감사','고맙','죄송','랑','이랑','지만','하지만',
                 '화이팅','파이팅','습니다','슴당','아요','에요','예요','아용','가용','바로','그냥','수정','파일','보내','올려','이모티콘', '따로',
                 '다고', '구나', 'ㅠㅠㅠㅠ', 'ㅠㅠㅠ', '잖아', '그거', '부분', '어제', '내일', '오늘', '을까요', '괜찮', '으면', '해야',
                 'ㅇㅋ', '각자', '이건', '이거', '상관없', '사진', '께서', '드릴게요', '오후', '오전', '우선', '걸로', '이번', '해도', '할까요', '월요일',
                 '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '까지', '드려요', '너무', '해요', '네네', '오늘', '다음', '아서', '셔서', '올리',
                 '진짜', '오빠', '누나', '언니', '의', '가', '이', '은', '들', '는', '좀', '잘', '걍', '과', '도', '를', '으로', '자', '에',
                 '와', '한', '하다', '다', '고', '을', '하', '있', '게', '보', '없', '세요', '아요', '습니다', '이', '있', '하', '것', '들',
                 '그', '되', '수', '이', '보', '않', '없', '나', '사람', '주', '아니', '등', '같', '우리', '때', '년', '가', '한', '지', '어요',
                 '네요', '대하', '오', '말', '일', '그렇', '이나', '위하', '는데', '있', '하', '것', '들', '그', '되', '수', '이', '보', '않',
                 '없', '나', '사람', '주', '아니', '등', '같', '우리', '때', '년', '가', '한', '지', '대하', '오', '말', '일', '그렇', '위하',
                 '때문', '그것', '두', '말하', '알', '그러나', '받', '못하', '일', '그런', '또', '문제', '더', '사회', '많', '그리고', '좋', '크',
                 '따르', '중', '나오', '가지', '씨', '시키', '만들', '지금', '생각하', '그러', '속', '하나', '집', '살', '모르', '적', '월', '데',
                 '자신', '안', '어떤', '내', '내', '경우', '명', '생각', '시간', '그녀', '다시', '이런', '앞', '보이', '번', '나', '다른', '어떻',
                 '여자', '개', '전', '들', '사실', '이렇', '점', '싶', '말', '정도', '좀', '원', '잘', '통하', '소리', '놓', '그럼', '혹시', '니다',
                 '에서', '아침', '점심', '저녁', '해서', '어서', '감사', '수고', '저희', '근데', '일단', '나요', '부터', '합니다', '니까', '안녕', '입니다']
    file_extension_list=make_file_extension_list("resource\\filename_extension_list.txt")
    for extension in file_extension_list:
        x=extension.replace(".","")
        stopwords.append(x)

    # 토큰화 및 불용어 제거
    tokenizer = Mecab()
    tokenized = []
    for sentence in sample_data['Content']:
        temp = tokenizer.morphs(sentence)  # 토큰화
        temp = [word for word in temp if not word in stopwords]  # 불용어 제거
        temp = [word for word in temp if len(word) > 1]
        tokenized.append(temp)

    # 전처리한 단어 데이터 데이터 프레임 구조로 변환
    vocab = FreqDist(np.hstack(tokenized))
    vocab = pd.DataFrame(vocab, {'count': [1]})
    vocab = vocab.transpose()
    vocab = vocab.sort_values(by='count', ascending=False)
    vocab.reset_index(inplace=True)


    # 상위 언급 10개 단어 추출
    dataf_10 = vocab.iloc[0:10]
    dataf_10 = dataf_10.reset_index()
    data10_dic = dataf_10['index']
    data10_dic = pd.Series(data10_dic)
    data10_list = list(data10_dic)
    print("키워드 추출완료\n")
    return data10_list,vocab


def make_pie_len(analysis_df):
    len_Name_list = list(analysis_df['Name'])
    len_cnt_list = list(analysis_df['Length'])

    plt.pie(len_cnt_list, labels=len_Name_list, autopct='%.1f%%')
    now_time=time.strftime('%Y-%m-%d-%H-%M', time.localtime(time.time()))
    filename="uploads\\img\\"+now_time+"(2)"+".png"
    filenames.append(filename)
    plt.savefig(filename)

def get_vocab(vocab):
    vocab_text=''
    str_list=list(vocab['index'])
    for vc in str_list:
        vocab_text+=vc+" "
    wordcloud = WordCloud(font_path='NanumGothic.ttf', width=1000, height=1000, max_words =80,max_font_size = 200, background_color='white').generate(vocab_text)
    plt.figure(figsize=(22,22)) #이미지 사이즈 지정
    plt.imshow(wordcloud, interpolation='lanczos') #이미지의 부드럽기 정도
    plt.axis('off') #x y 축 숫자 제거
    now_time = time.strftime('%Y-%m-%d-%H-%M', time.localtime(time.time()))
    filename = "uploads\\img\\" + now_time +"(1)"+ ".png"
    filenames.append(filename)
    plt.savefig(filename)

def app_run(*file):
    filenames=[]
    chat_text_ver, lines = file_input(file)
    print("\nchat_text_ver: ", chat_text_ver)

    chatting = delete_newline(lines)
    participants = []
    data = []
    participants, data = chat_data_extract(chat_text_ver, chatting)#extract할때 의미없는 단어들 제거됨
    participants, data = filter_participants(participants,data)

    initial_df=make_initial_df(data)
    df_for_making_keyword_list=make_sample_df(initial_df)

    keyword_list, vocab = make_keyword(df_for_making_keyword_list)
    get_vocab(vocab)

    initial_df_for_ML = make_df_for_ML(participants, initial_df)
    make_pie_len(initial_df_for_ML)


    print("그래프 이미지 파일 저장 완료\n")
    print("\n\n\n결과:\n")
    print("\n가장 자주 나온 키워드 10개: ", *keyword_list)
    print("\ninitial_df_for_ML:\n", initial_df_for_ML)

    return initial_df_for_ML

if __name__=="__main__":
    app_run()

