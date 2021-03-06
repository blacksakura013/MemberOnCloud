import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import moment from 'moment';
import DatePicker from '../components/DatePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Button, Body, Left, Right, Title } from 'native-base';
import { Language } from '../translations/I18n';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import { FontSize } from '../components/FontSizeHelper';
import { DateHelper } from '../components/DateHelper';
import DeviceInfo from 'react-native-device-info';
import Icons from 'react-native-vector-icons/FontAwesome';
import * as Constants from '../src/Constants';
import { useStateIfMounted } from 'use-state-if-mounted';
import Colors from '../src/Colors';
import {
  TouchableNativeFeedback,
  TouchableOpacity,
  ScrollView,
} from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import * as registerActions from '../src/actions/registerActions';
import * as userActions from '../src/actions/userActions';
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const RegisterScreen = () => {
  const [loading, setLoading] = useStateIfMounted(false);
  const navigation = useNavigation();
  const [date, setDate] = useState(moment().format('YYYYMMDD'));
  const [rePass, setRePass] = useState('');
  const [resultJson, setResultJson] = useState('');
  const [GUID, setGUID] = useState('');
  const [machineNo, setMachineNo] = useState('');
  const registerReducer = useSelector(({ registerReducer }) => registerReducer);
  const loginReducer = useSelector(({ loginReducer }) => loginReducer);
  const userReducer = useSelector(({ userReducer }) => userReducer);
  const databaseReducer = useSelector(({ databaseReducer }) => databaseReducer);
  const [userIndex, setUserIndex] = useState(loginReducer.index);
  const dispatch = useDispatch();
  const [title, setTitle] = useState(Language.t('register.select'));

  const [data, setData] = useState({
    check_textInputChange: false,
    secureTextEntry: true,
  });
  const [data2, setdata2] = useState(false);
  const [data3, setdata3] = useState(false);

  const [newData, setNewData] = useState({
    password: '',
    birthDate: moment().format('YYYYMMDD'),
    phoneNum: '',
    idCard: '',

  });
  useEffect(() => {
    console.log(registerReducer)
  }, [])
  const textInputChange = (val) => {
    if (val.length !== 0) {
      setData({
        ...data,
        check_textInputChange: true,
      });
    } else {
      setData({
        ...data,
        check_textInputChange: false,
      });
    }
  };

  const handlePasswordChange = (val) => {
    setData({
      ...data,
      password: val,
    });
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const regisMacAdd = async () => {
    console.log('REGIS MAC ADDRESS' + databaseReducer.Data.urlser + '/DevUsers');
    console.log(JSON.stringify({
      'BPAPUS-BPAPSV': loginReducer.serviceID,
      'BPAPUS-LOGIN-GUID': '',
      'BPAPUS-FUNCTION': 'Register',
      'BPAPUS-PARAM':
        '{"BPAPUS-MACHINE":"' +
        registerReducer.machineNum +
        '","BPAPUS-CNTRY-CODE": "66","BPAPUS-MOBILE": "' +
        newData.phoneNum +
        '"}',
    }))
    await fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Register',
        'BPAPUS-PARAM':
          '{"BPAPUS-MACHINE":"' +
          registerReducer.machineNum +
          '","BPAPUS-CNTRY-CODE": "66","BPAPUS-MOBILE": "' +
          newData.phoneNum +
          '"}',
      }),
    })
      .then((response) => response.json())
      .then(async (json) => {
        if (json.ResponseCode == 200 && json.ReasonString == 'Completed') {
          await _fetchGuidLogin();
        } else {
          console.log('REGISTER MAC FAILED', json.ResponseCode);
        }
      })
      .catch((error) => {
        console.log('ERROR at regisMacAdd ' + error);
        console.log('http', databaseReducer.Data.urlser);
        if (databaseReducer.Data.urlser == '') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('selectBase.error'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        } else {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('alert.internetError'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        }
        setLoading(false)
      });
  };

  const _fetchGuidLogin = () => {

    let GUID = '';
    fetch(databaseReducer.Data.urlser + '/DevUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': '',
        'BPAPUS-FUNCTION': 'Login',
        'BPAPUS-PARAM':
          '{"BPAPUS-MACHINE": "' +
          registerReducer.machineNum +
          '","BPAPUS-USERID": "' +
          loginReducer.userNameSer +
          '","BPAPUS-PASSWORD": "' +
          loginReducer.passwordSer +
          '"}',
      }),
    })
      .then((response) => response.json())
      .then(async (json) => {
        let responseData = JSON.parse(json.ResponseData);
        setGUID(responseData.BPAPUS_GUID);
        GUID = responseData.BPAPUS_GUID;
        console.log()
        console.log(`GUID >> ${GUID}`)
        await fetch(databaseReducer.Data.urlser + '/MbUsers', {
          method: 'POST',
          body: JSON.stringify({
            'BPAPUS-BPAPSV': loginReducer.serviceID,
            'BPAPUS-LOGIN-GUID': GUID,
            'BPAPUS-FUNCTION': 'Register',
            'BPAPUS-PARAM':
              '{"MB_I_CARD": "' +
              newData.idCard +
              '","MB_EMAIL": "mobile@gmail.com","MB_CNTRY_CODE": "66","MB_REG_MOBILE":  "' +
              newData.phoneNum +
              '","MB_PW": "1234"}',
          }),
        })
          .then((response) => response.json())
          .then(async (json) => {
            console.log(json)
            if (json.ResponseCode == '200')
              await fetchUserData(GUID, true)
            else Alert.alert(
              Language.t('alert.errorTitle'),
              Language.t('alert.errorDetail'), [{ text: Language.t('alert.ok'), onPress: () => setLoading(false) }])
          })
          .catch((error) => {
            console.error('ERROR at _fetchGuidLogin' + error)
            Alert.alert(
              Language.t('alert.errorTitle'),
              Language.t('alert.errorDetail'), [{ text: Language.t('alert.ok'), onPress: () => setLoading(false) }]);
          });
      })
      .catch((error) => {
        console.error('ERROR at _fetchGuidLogin' + error);
        if (databaseReducer.Data.urlser == '') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('selectBase.error'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        } else {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('alert.internetError'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        }
        setLoading(false)
      });


  };

  const fetchUserData = async (GUID, C_Data) => {
    console.log('FETCH /LookupErp', databaseReducer.Data.urlser);
    console.log(`C_Data ${C_Data}`)
    let xresult = '';

    console.log('FETCH /MbUsers');
    await fetch(databaseReducer.Data.urlser + '/MbUsers', {
      method: 'POST',
      body: JSON.stringify({
        'BPAPUS-BPAPSV': loginReducer.serviceID,
        'BPAPUS-LOGIN-GUID': GUID,
        'BPAPUS-FUNCTION': 'LoginByMobile',
        'BPAPUS-PARAM':
          '{"MB_CNTRY_CODE": "66","MB_REG_MOBILE": "' +
          newData.phoneNum +
          '",    "MB_PW": "' +
          '1234' +
          '"}'
      }),
    })
      .then((response) => response.json())
      .then(async (json) => {
        if (json.ResponseCode == '635') {
          console.log('NOT FOUND MEMBER');

          Alert.alert('', Language.t('login.errorNotfoundUsername'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);

        } else if (json.ResponseCode == '629') {
          console.log('Function Parameter Required');
        } else if (json.ResponseCode == '200') {
          let responseData = JSON.parse(json.ResponseData);
          let MB_LOGIN_GUID = responseData.MB_LOGIN_GUID;
          _onPressYes(MB_LOGIN_GUID, GUID);
        } else {
          console.log(json.ReasonString);
        }
        setLoading(false)
      })
      .catch((error) => {
        if (databaseReducer.Data.urlser == '') {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('selectBase.error'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        } else {
          Alert.alert(
            Language.t('alert.errorTitle'),
            Language.t('alert.internetError'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
        } console.log('ERROR FETCH LoginByMobile : ' + error)
        setLoading(false)
      }
      );

  }

 


const checKPassword = () => {
  setLoading(true)
  if (newData.password !== rePass) {
    Alert.alert('', Language.t('register.validationNotMatchPassword'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
    setLoading(false)
  } else _setDispatch();
};
const _setDispatch = () => {
  let check = false;
  setLoading(true)
  if (newData.idCard == '' && !check) {
    Alert.alert(
      Language.t('register.titleHeader'),
      Language.t('register.validationEmptyIdCard'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
    check = true
  } else if (newData.idCard.toString().length >= 1 && newData.idCard.toString().length < 13 && !check) {
    check = true
    Alert.alert(Language.t('register.titleHeader'),
      Language.t('register.validationIncorrectIdCard'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
  }
  if (newData.phoneNum == '' && !check) {
    Alert.alert(
      Language.t('register.titleHeader'),
      Language.t('register.mobileNo'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
    check = true
  }
  if (newData.password == '' && !check) {
    Alert.alert(
      Language.t('register.titleHeader'),
      Language.t('register.password'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
    check = true
  } else if (newData.password.length >= 1 && newData.password.length < 6) {
    check = true
    Alert.alert('', Language.t('register.validationLessPassword'), [{ text: Language.t('alert.ok'), onPress: () => console.log('OK Pressed') }]);
  }
  if (!check) {
    regisMacAdd()
  } else {
    setLoading(false)
  }
}

const _onPressYes = async (MB_LOGIN_GUID, GUID) => {
  const navi = 'LoginScreen';
  const newnvi = { navi, MB_LOGIN_GUID, newData, GUID };
  
  setLoading(false)
  navigation.navigate('AuthenticationScreen', { navi: newnvi });
}

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fffff' }}>

    <Header
      style={{
        backgroundColor: Colors.backgroundColorSecondary,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.7,
      }}>

      <Left>
        <Button transparent onPress={() => navigation.goBack()}>
          <Icons size={FontSize.large} name="angle-left" style={{ color: 'black' }} />
        </Button>
      </Left>
      <Body>
        <Title style={{ color: 'black', fontSize: FontSize.medium }}>
          {Language.t('register.header')}
        </Title>
      </Body>
      <Right />
    </Header>

    <KeyboardAvoidingView keyboardVerticalOffset={1}  >
      <View style={{ backgroundColor: '#fffff' }} >

        {Platform.OS === 'ios' ? (
          <ScrollView >
            <KeyboardAvoidingView
              behavior={'padding'}
              keyboardVerticalOffset={100}
              enabled>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container1} >
                  <Text
                    style={{
                      fontSize: FontSize.large,
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                      color: Colors.textColor,
                    }}>
                    {Language.t('register.titleHeader')}
                  </Text>

                  <Text style={styles.textTitle}>
                    {Language.t('register.mobileNo')}
                  </Text>
                  <View style={{
                    backgroundColor: Colors.backgroundColorSecondary,
                    marginTop: 5,
                    borderRadius: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    height: 'auto',
                    paddingBottom: 10,
                    borderColor: 'gray',
                    borderWidth: 0.7,
                    flexDirection: 'row',
                  }}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="number-pad"
                      placeholderTextColor={Colors.fontColorSecondary}
                      maxLength={10}
                      dataDetectorTypes="phoneNumber"
                      placeholder={Language.t(
                        'register.validationEmptyPhoneNumber',
                      )}
                      onChangeText={(val) => {
                        setNewData({ ...newData, phoneNum: val });
                        setdata3(true);
                        if (val === '') {
                          setdata3(false);
                        }
                      }}
                    />
                    {data3 ? (
                      <Icons
                        name="check-circle"
                        size={25}
                        color={Colors.buttonColorPrimary}></Icons>
                    ) : null}
                  </View>
                  <Text style={styles.textTitle}>
                    {Language.t('register.idCard')}
                  </Text>
                  <View style={{
                    backgroundColor: Colors.backgroundColorSecondary,
                    marginTop: 5,
                    borderRadius: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    height: 'auto',
                    paddingBottom: 10,
                    borderColor: 'gray',
                    borderWidth: 0.7,
                    flexDirection: 'row',
                  }}>
                    <TextInput
                      placeholderTextColor={Colors.fontColorSecondary}
                      maxLength={13}
                      keyboardType="number-pad"
                      placeholder={Language.t('register.validationEmptyIdCard')}
                      onChangeText={(val) => {
                        setNewData({ ...newData, idCard: val });
                      }}
                      style={styles.textInput}></TextInput>
                  </View>

                  <Text style={styles.textTitle}>
                    {Language.t('register.password')}
                  </Text>
                  <View style={{
                    backgroundColor: Colors.backgroundColorSecondary,
                    marginTop: 5,
                    borderRadius: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    height: 'auto',
                    paddingBottom: 10,
                    borderColor: 'gray',
                    borderWidth: 0.7,
                    flexDirection: 'row',
                  }}>
                    <TextInput
                      style={styles.textInput}
                      secureTextEntry={data.secureTextEntry ? true : false}
                      placeholderTextColor={Colors.fontColorSecondary}
                      keyboardType="default"

                      placeholder={Language.t('register.validationEmptyPassword')}
                      autoCapitalize="none"
                      onChangeText={(val) => {
                        handlePasswordChange(val);
                        setNewData({ ...newData, password: val });
                      }}
                    />
                    <TouchableOpacity onPress={updateSecureTextEntry}>
                      {data.secureTextEntry ? (
                        <Icons
                          name="eye-slash"
                          size={25}
                          color={Colors.buttonColorPrimary}
                        />
                      ) : (
                        <Icons
                          name="eye"
                          size={25}
                          color={Colors.buttonColorPrimary}></Icons>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.textTitle}>
                    {Language.t('register.confirmPassword')}
                  </Text>
                  <View style={{
                    backgroundColor: Colors.backgroundColorSecondary,
                    marginTop: 5,
                    borderRadius: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    height: 'auto',
                    paddingBottom: 10,
                    borderColor: 'gray',
                    borderWidth: 0.7,
                    flexDirection: 'row',
                  }}>
                    <TextInput
                      style={styles.textInput}
                      secureTextEntry={data.secureTextEntry ? true : false}
                      placeholderTextColor={Colors.fontColorSecondary}
                      keyboardType="default"
                      autoCapitalize="none"
                      onChangeText={(val) => {
                        handlePasswordChange(val);
                        setRePass(val);
                      }}

                      placeholder={Language.t(
                        'register.validationEmptyConfirmPassword',
                      )}
                    />
                  </View>

                  <View
                    style={{
                      marginTop: 10,

                      justifyContent: 'flex-end',
                      flexDirection: 'column',
                    }}>
                    <TouchableNativeFeedback onPress={checKPassword}>
                      <View style={styles.button}>
                        <Text style={styles.textButton}>
                          {Language.t('register.buttonRegister')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </ScrollView>
        ) : (
          <ScrollView    >
            <View style={styles.container1} >
              <KeyboardAvoidingView
                behavior={'padding'}
                enabled
                keyboardVerticalOffset={-170}
              >
                <Text
                  style={{
                    fontSize: FontSize.large,
                    textDecorationLine: 'underline',
                    fontWeight: 'bold',
                    color: Colors.textColor,
                  }}>
                  {Language.t('register.titleHeader')}
                </Text>
                <Text style={styles.textTitle}>
                  {Language.t('register.mobileNo')}
                </Text>
                <View
                  style={{
                    backgroundColor: Colors.backgroundColorSecondary,
                    marginTop: 5,
                    borderRadius: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    height: 'auto',
                    paddingBottom: 10,
                    borderColor: 'gray',
                    borderWidth: 0.7,
                    flexDirection: 'row',
                  }}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.fontColorSecondary}
                    maxLength={10}
                    dataDetectorTypes="phoneNumber"
                    placeholder={Language.t(
                      'register.validationEmptyPhoneNumber',
                    )}
                    onChangeText={(val) => {
                      setNewData({ ...newData, phoneNum: val });
                      setdata3(true);
                      if (val === '') {
                        setdata3(false);
                      }
                    }}
                  />
                  {newData.phoneNum.length == 10 ? (
                    <Icons
                      name="check-circle"
                      size={25}
                      color={Colors.buttonColorPrimary}></Icons>
                  ) : null}

                </View>

                <Text style={styles.textTitle}>
                  {Language.t('register.idCard')}
                </Text>
                <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  marginTop: 5,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  height: 'auto',
                  paddingBottom: 10,
                  borderColor: 'gray',
                  borderWidth: 0.7,
                  flexDirection: 'row',
                }}>
                  <TextInput
                    placeholderTextColor={Colors.fontColorSecondary}
                    maxLength={13}
                    keyboardType="number-pad"
                    placeholder={Language.t('register.validationEmptyIdCard')}
                    onChangeText={(val) => {
                      setNewData({ ...newData, idCard: val });
                    }}
                    style={styles.textInput}></TextInput>
                </View>


                <Text style={styles.textTitle}>
                  {Language.t('register.password')}
                </Text>
                <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  marginTop: 5,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  height: 'auto',
                  paddingBottom: 10,
                  borderColor: 'gray',
                  borderWidth: 0.7,
                  flexDirection: 'row',
                }}>
                  <TextInput
                    style={styles.textInput}
                    secureTextEntry={data.secureTextEntry ? true : false}
                    placeholderTextColor={Colors.fontColorSecondary}
                    keyboardType="default"
                    placeholder={Language.t('register.validationEmptyPassword')}
                    autoCapitalize="none"
                    onChangeText={(val) => {
                      handlePasswordChange(val);
                      setNewData({ ...newData, password: val });
                    }}
                  />

                  <TouchableOpacity onPress={updateSecureTextEntry}>
                    {data.secureTextEntry ? (
                      <Icons
                        name="eye-slash"
                        size={25}
                        color={Colors.buttonColorPrimary}
                      />
                    ) : (
                      <Icons
                        name="eye"
                        size={25}
                        color={Colors.buttonColorPrimary}></Icons>
                    )}

                  </TouchableOpacity>
                </View>
                <Text style={styles.textTitle}>
                  {Language.t('register.confirmPassword')}
                </Text>
                <View style={{
                  backgroundColor: Colors.backgroundColorSecondary,
                  marginTop: 5,
                  borderRadius: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  height: 'auto',
                  paddingBottom: 10,
                  borderColor: 'gray',
                  borderWidth: 0.7,
                  flexDirection: 'row',
                }}>
                  <TextInput
                    style={styles.textInput}
                    secureTextEntry={data.secureTextEntry ? true : false}
                    placeholderTextColor={Colors.fontColorSecondary}
                    keyboardType="default"
                    autoCapitalize="none"
                    onChangeText={(val) => {
                      handlePasswordChange(val);
                      setRePass(val);
                    }}
                    placeholder={Language.t(
                      'register.validationEmptyConfirmPassword',
                    )}
                  />
                </View>
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: 'flex-end',
                    flexDirection: 'column',
                  }}>
                  <TouchableNativeFeedback onPress={checKPassword}>
                    <View style={styles.button}>
                      <Text style={styles.textButton}>
                        {Language.t('register.buttonRegister')}
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </KeyboardAvoidingView>
            </View>
          </ScrollView>)}
      </View>
    </KeyboardAvoidingView>

    {loading && (
      <View
        style={{
          width: deviceWidth,
          height: deviceHeight,
          opacity: 0.5,
          backgroundColor: 'gray',
          alignSelf: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          position: 'absolute',
        }}>
        <ActivityIndicator
          style={{
            justifyContent: 'center',
            alignItems: 'center',

            backgroundColor: null
          }}
          animating={loading}
          size="large"
          color="white"
        />
      </View>
    )}
  </SafeAreaView>
);
};
const styles = StyleSheet.create({
  container1: {
    backgroundColor: Colors.backgroundColorSecondary,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 0,
    flex: 1,
    flexDirection: 'column',

  },
  button: {
    marginTop: 10,
    padding: 5,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: Colors.buttonColorPrimary,
    borderRadius: 10,
  },
  textTitle: {
    marginTop: Platform.OS === 'ios' ? 15 : 7,
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
  textTitle2: {
    alignSelf: 'center',
    fontSize: FontSize.medium,
    color: Colors.fontColor,
  },
  textButton: {
    color: Colors.fontColor2,
    fontSize: FontSize.medium,
    padding: 10,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  textInput: {
    flex: 8,

    borderBottomColor: Colors.borderColor,
    color: Colors.fontColor,
    paddingVertical: 3,
    fontSize: FontSize.medium,
    height: 'auto',
    borderBottomWidth: 0.7,
  },
});
const mapStateToProps = (state) => {
  return {
    // title: state.registerReducer.title,
    // firstName: state.registerReducer.firstName,
    // lastName: state.registerReducer.lastName,
    // birthDate: state.registerReducer.birthDate,
    // phoneNum: state.registerReducer.phoneNum,
    // password: state.registerReducer.password,
    // machineNum: state.loginReducer.machineNo,
    // userData: state.userReducer.userData,
    // sex: state.registerReducer.sex,
    // ADDR_1: state.registerReducer.ADDR_1,
    // ADDR_2: state.registerReducer.ADDR_2,
    // ADDR_3: state.registerReducer.ADDR_3,
    // postcode: state.registerReducer.postcode,
    // email: state.registerReducer.email,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // reduxTitle: (payload) => dispatch(nameTitle(payload)),
    // reduxFirstName: (payload) => dispatch(firstName(payload)),
    // reduxLastName: (payload) => dispatch(lastName(payload)),
    // reduxBirthDate: (payload) => dispatch(birthDate(payload)),
    // reduxMachineNum: (payload) => dispatch(machine(payload)),
    // reduxPhoneNum: (payload) => dispatch(phoneNum(payload)),
    // reduxPassword: (payload) => dispatch(password(payload)),
    // reduxSex: (payload) => dispatch(sex(payload)),
    // reduxADDR_1: (payload) => dispatch(ADDR_1(payload)),
    // reduxADDR_2: (payload) => dispatch(ADDR_2(payload)),
    // reduxADDR_3: (payload) => dispatch(ADDR_3(payload)),
    // reduxPostcode: (payload) => dispatch(postcode(payload)),
    // reduxEmail: (payload) => dispatch(email(payload)),
    // reduxSetUserData: (payload) => dispatch(setUserData(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScreen);
