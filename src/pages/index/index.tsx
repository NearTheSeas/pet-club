import Taro, { Component, Config } from "@tarojs/taro";
import { View, Picker, Text } from "@tarojs/components";
import { AtForm, AtInput, AtIcon } from "taro-ui";
import "./index.less";

import MMap from "../../Components/AMap";

interface IndexState {
  address?: string;
  destination?: string;
  timeSel?: string;
  countSelector?: number[];
  selectorChecked?: number;
  showModal?: boolean;
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
      address: "",
      position: {},
      destination: "伙伴宠物乐园",
      timeSel: "18:30",
      countSelector: [1, 2, 3],
      selectorChecked: 0,
      showModal: false
    };
  }

  onInputFocus() {
    this.setState({
      showModal: true
    });
  }

  handleAddressChange(value) {
    this.setState({
      address: value
    });
  }

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

  setLocation = ({ address, position }): any => {
    this.setState({ address, position, showModal: false });
  };

  componentWillMount() {}

  componentDidMount() {
    this.getLocation();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const {
      address,
      position,
      timeSel,
      selectorChecked,
      countSelector,
      showModal
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
              className="index-select"
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
          <a href="" className="index-btn ">
            <AtIcon value="clock" size="30" color="#000" />
            <Text>预约用车</Text>
          </a>
        </View>
        {showModal ? (
          <MMap
            address={address}
            position={position}
            setLocation={this.setLocation}
          />
        ) : null}
      </View>
    );
  }
}
