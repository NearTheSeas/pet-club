import Taro, { Component, Config } from "@tarojs/taro";
import { View, Picker, Text } from "@tarojs/components";
import axios from "axios";
import {
  AtForm,
  AtInput,
  AtIcon,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtButton
} from "taro-ui";
import "./index.less";

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
    this.initMap();
  }

  handleAddressChange(value) {
    this.setState({
      address: value
    });
  }

  onSubmit(event) {
    console.log(event);
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

  initMap() {
    const { address } = this.state;
    let AMap = window.AMap;
    var map = new AMap.Map(`map-container`, {
      resizeEnable: true,
      zoom: 11,
      center: [116.397428, 39.90923] //默认的地图中心经纬度
    });

    AMap.plugin(["AMap.Autocomplete", "AMap.PlaceSearch"], function() {
      let autocomplete = new AMap.Autocomplete({
        city: "北京", //城市，默认全国
        input: "address_input" //使用联想输入的input的id（也就是上边那个唯一的id）
      });

      let placeSearch = new AMap.PlaceSearch({
        city: "北京",
        map: map
      });

      AMap.event.addListener(autocomplete, "select", function(e) {
        //TODO 针对选中的poi实现自己的功能
        // placeSearch.setCity(e.poi.adcode);
        // placeSearch.search(e.poi.name);
        console.log(e.poi);
      });
    });
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const {
      address,
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
        {/* {showModal ? <View id="map-container" /> : null} */}
        <View id="map-container" /> 
        {/* <AtModal isOpened={showModal}>
          <AtModalHeader>标题</AtModalHeader>
          <AtModalContent>
          <View id="map-container" />
          </AtModalContent>
          <AtModalAction>
            <AtButton>确定</AtButton>
          </AtModalAction>
        </AtModal> */}
      </View>
    );
  }
}
