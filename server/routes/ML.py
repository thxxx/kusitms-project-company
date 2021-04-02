import sklearn
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import txt_to_df as tdd


def csv_to_df(filename):
    while True:
        try:
            f=open(filename,'r')
        except FileNotFoundError:
            print("파일이 없습니다..")
        else:
            df=pd.read_csv(filename)
            break
    f.close()
    return df

def make_ML_model(df):
    features=["Count Ratio","Length Ratio","File Ratio","Key Ratio"]
    target=["Contribution"]
    x_train, x_test, y_train, y_test = train_test_split(df[features], df.Contribution, test_size=0.3, random_state=11)
    mlr = LinearRegression()
    mlr.fit(x_train, y_train)
    y_predict = mlr.predict(x_test)
    plt.scatter(y_test, y_predict, alpha=0.3)
    plt.xlabel("y_test")
    plt.ylabel("Predicted")
    plt.title("multiple linear regression")
    #plt.show()

    print(mean_squared_error(y_test,mlr.predict(x_test)))
    return mlr

def input_for_analysis():
    while True:
        input_file = input("분석할 txt 파일 입력(예: kakaotalk.txt): ")
        if not input_file.endswith(".txt"):
            print("올바른 파일 형식이 아닙니다.")
        else:
            break
    return input_file

def calc_contribution(mlr,df):
    input_x = initial_df[["Count Ratio", "Length Ratio", "File Ratio", "Key Ratio"]]
    print(input_x)
    predicted_contribution = mlr.predict(input_x)

    contri_sum = 0
    for contribution in predicted_contribution:
        contri_sum += contribution

    new_contribution = []

    for contribution in predicted_contribution:
        new_contribution.append(contribution / contri_sum * 100)

    return new_contribution


def make_username_key(sample_data):  # User Name 추출 in sample_data
    '''

    :param sample_data: DataFrame
    :return: Name Column에 있는 이름 리스트
    '''
    User_name_1 = list(sample_data['Name'])
    User_name_1

    User_name = []
    for v in User_name_1:
        if v not in User_name:
            User_name.append(v)

    return (User_name)

if __name__=="__main__":
    df=csv_to_df("data.csv")

    mlr=make_ML_model(df)

    #input_file=input_for_analysis()
    input_file="dataset\\original_data\\29.txt" #여기에 경로
    initial_df = tdd.app_run(input_file)
    #filename list는 그냥 전역변수 filenames
    username=make_username_key(initial_df) #username list
    contri_list=calc_contribution(mlr,initial_df) #기여도 list
    print(contri_list)
    send_to_server=[tdd.filenames,username,contri_list]
    print(send_to_server)
