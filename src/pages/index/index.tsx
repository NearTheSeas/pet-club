import Taro, { Component, Config } from "@tarojs/taro";
import { View, Picker, Text, Button } from "@tarojs/components";
import {
  AtForm,
  AtInput,
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtMessage
} from "taro-ui";
import moment from "moment";
import "./index.less";

import MMap from "../../Components/AMap";

interface IndexState {
  address?: string;
  destination?: string;
  timeSel?: string;
  countSelector?: number[];
  selectorChecked?: number;
  showMapModal?: boolean;
}

declare global {
  interface Window {
    AMap: {
      Map;
      plugin;
      ToolBar;
      PlaceSearch;
      event;
      Autocomplete;
      Marker;
      LngLat;
      Geolocation;
    };
  }
}

export default class Index extends Component<IndexState, any> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: "伙伴宠物乐园"
  };

  constructor() {
    super(...arguments);
    this.state = {
      user: null,
      address: "",
      position: {},
      destination: "伙伴宠物乐园",
      daySel: "",
      timeSel: "18:30",
      countSelector: [1, 2, 3, 4, 5],
      selectorChecked: 0,
      showMapModal: false,
      showTelModal: false,
      mobile: null,
      clickSend: false,
      timeCounter: 60,
      serverCode: null,
      inputCode: null
    };
  }

  componentWillMount() {
    this.getLocation();
  }

  componentDidMount() {
    let day = moment().format("YYYY-MM-DD");
    let time = moment()
      .add(1, "h")
      .format("HH:mm");
    this.setState({ daySel: day, timeSel: time });

    Taro.request({
      url: "/user/me",
      header: {
        "content-type": "application/json"
      }
    }).then(({ data: { code, data } }) => {
      if (code == 200) this.setState({ user: data });
    });
  }

  // 获取用户定位
  getLocation() {
    let that = this;
    let AMap = window.AMap;

    AMap.plugin(["AMap.Geolocation"], function() {
      // 定位IMapPropsIMapProps
      var geolocation = new AMap.Geolocation();
      geolocation.getCurrentPosition();

      AMap.event.addListener(geolocation, "complete", function(data) {
        let { formattedAddress, position } = data;

        that.setState({ address: formattedAddress, position });
      });
      AMap.event.addListener(geolocation, "error", function(error) {
        console.log(error);
      });
    });
  }

  onInputFocus() {
    this.setState({
      showMapModal: true
    });
  }

  handleAddressChange(value) {
    this.setState({
      address: value
    });
  }

  handleTelChange = value => {
    this.setState({
      mobile: value
    });
  };

  handleInputCodeChange = value => {
    this.setState({
      inputCode: value
    });
  };

  onDayChange = e => {
    console.log(e.detail);
    this.setState({
      daySel: e.detail.value
    });
  };

  onTimeChange = e => {
    console.log(e.detail);
    this.setState({
      timeSel: e.detail.value
    });
  };

  onCountChange = e => {
    this.setState({
      selectorChecked: e.detail.value
    });
  };

  setLocation = ({ address, position }): any => {
    this.setState({ address, position, showMapModal: false });
  };

  clickSend = () => {
    const { mobile } = this.state;
    if (mobile) {
      Taro.request({
        url: "/user/sendCode",
        data: {
          mobile
        },
        header: {
          "content-type": "application/json"
        }
      }).then(({ data: { code, data } }) => {
        if (code == 200) this.setState({ serverCode: data });
      });

      this.setState({ clickSend: true });
      let Timer = setInterval(() => {
        let { timeCounter } = this.state;
        if (timeCounter > 1) {
          this.setState({ timeCounter: timeCounter - 1 });
        } else {
          this.setState({ timeCounter: 60, clickSend: false });
          clearInterval(Timer);
        }
      }, 1000);
    } else {
      Taro.atMessage({
        message: "请输入正确的手机号码",
        type: "error"
      });
    }
  };

  bindMobile = () => {
    const { inputCode, serverCode, mobile, user } = this.state;
    if (inputCode && inputCode == serverCode) {
      Taro.request({
        url: "/user/mobileLogin",
        data: {
          mobile,
          code: inputCode,
          openId: user.openId
        },
        header: {
          "content-type": "application/json"
        }
      }).then(({ data: { code, msg, data } }) => {
        console.log(code);
        console.log(data);
        if (code == 200) {
          this.setState(
            {
              showTelModal: false,
              user: { ...data }
            },
            () => {
              this.submitSubscribe();
            }
          );
        } else {
          Taro.atMessage({
            message: msg,
            type: "error"
          });
          return null;
        }
      });
    } else {
      Taro.atMessage({
        message: "验证码错误",
        type: "error"
      });
    }
  };

  clickCancel = () => {
    this.setState({ showTelModal: false });
  };

  submitSubscribe = () => {
    const {
      user,
      position,
      address,
      daySel,
      timeSel,
      mobile,
      countSelector,
      selectorChecked
    } = this.state;
    if (!this.state.user.mobile) {
      this.setState({ showTelModal: true });
      return null;
    }

    if (!position.lat) {
      Taro.atMessage({
        message: "没有获取到您的位置",
        type: "error"
      });
      return null;
    }

    Taro.request({
      url: "/order",
      method: "PUT",
      data: {
        lat: position.lat,
        lon: position.lng,
        openId: user.openId,
        address,
        mobile,
        appointment: daySel + " " + timeSel,
        num: countSelector[selectorChecked]
      },
      header: {
        "content-type": "application/json"
      }
    }).then(({ data: { code, msg } }) => {
      if (code == 200) {
        Taro.atMessage({
          message: msg,
          type: "success"
        });
      } else {
        Taro.atMessage({
          message: msg,
          type: "error"
        });
        return null;
      }
    });
  };

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const {
      address,
      position,
      daySel,
      timeSel,
      selectorChecked,
      countSelector,
      showMapModal,
      showTelModal,
      mobile,
      clickSend,
      timeCounter,
      inputCode
    } = this.state;
    return (
      <View className="index-wrapper">
        <View className="form-wrapper">
          <AtForm>
            <AtInput
              name="value"
              title="地址"
              type="text"
              className="index-input address_input"
              placeholder="请输入您的地址"
              value={address}
              onChange={this.handleAddressChange.bind(this)}
              onFocus={this.onInputFocus.bind(this)}
            />
            <AtInput
              disabled
              name="value"
              title="目的地"
              type="text"
              className="index-input"
              placeholder="单行文本"
              value={this.state.destination}
              onChange={this.handleAddressChange.bind(this)}
            />
            <Picker
              mode="date"
              value={daySel}
              className="index-select"
              onChange={this.onDayChange.bind(this)}
            >
              <View className="picker">
                <View className="at-row">
                  <View className="at-col at-col-4">预约日期</View>
                  <View className="at-col at-col-8 ">{daySel}</View>
                </View>
              </View>
            </Picker>
            <Picker
              mode="time"
              value={timeSel}
              className="index-select"
              onChange={this.onTimeChange.bind(this)}
            >
              <View className="picker">
                <View className="at-row">
                  <View className="at-col at-col-4">预约时间</View>
                  <View className="at-col at-col-8 ">{timeSel}</View>
                </View>
              </View>
            </Picker>
            <Picker
              mode="selector"
              value={selectorChecked}
              range={countSelector}
              className="index-select noborder"
              onChange={this.onCountChange.bind(this)}
            >
              <View className="picker">
                <View className="at-row">
                  <View className="at-col at-col-4">爱狗数量</View>
                  <View className="at-col at-col-8 ">
                    {countSelector[selectorChecked]}
                  </View>
                </View>
              </View>
            </Picker>
          </AtForm>
        </View>
        <View className="btn-wrapper at-row at-row__align--center">
          <a onClick={this.submitSubscribe} className="index-btn ">
            <AtIcon value="clock" size="30" color="#000" />
            <Text>预约用车</Text>
          </a>
        </View>
        {showMapModal ? (
          <MMap
            address={address}
            position={position}
            setLocation={this.setLocation}
          />
        ) : null}

        <AtModal isOpened={showTelModal}>
          <AtModalHeader>绑定手机号</AtModalHeader>
          <AtModalContent>
            <AtInput
              clear
              type="phone"
              name=""
              placeholder="请输入手机号码"
              value={mobile}
              onChange={this.handleTelChange}
            />
            <AtInput
              clear
              type="code"
              name=""
              placeholder="验证码"
              value={inputCode}
              onChange={this.handleInputCodeChange}
            >
              {clickSend ? (
                <text>{timeCounter}秒后重试</text>
              ) : (
                <text onClick={this.clickSend}>发送验证码</text>
              )}
            </AtInput>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.clickCancel}>取消</Button>
            <Button onClick={this.bindMobile}>确定</Button>
          </AtModalAction>
        </AtModal>
        <AtMessage />
      </View>
    );
  }
}
