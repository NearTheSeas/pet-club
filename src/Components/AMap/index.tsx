import Taro, { Component } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";
import "./index.less";

interface AMapState {
  address?: string;
  position?: {
    lat?: number;
    lng?: number;
  };
}

interface IMapProps {
  address?: string;
  position?: {
    lat?: number;
    lng?: number;
  };
  setLocation: ({ address: string, position }) => {};
}

export default class AMapComponent extends Component<IMapProps, AMapState> {
  constructor() {
    super(...arguments);
    this.state = {
      address: "",
      position: {}
    };
  }

  handleConfirm = e => {
    const { address, position } = this.state;
    const { setLocation } = this.props;
    if (address) {
      setLocation({
        address,
        position
      });
    }
  };

  loadMap = () => {
    const { address, position } = this.state;
    let domElm = document.querySelector("#address_input")!;
    domElm.value = address;
    let that = this;
    let marker,
      AMap = window.AMap;

    // let AMapUI = window.AMapUI;
    let map = new AMap.Map("map-container", {
      zoom: 14, //缩放级别
      resizeEnable: true
    });

    if (address) {
      marker = new AMap.Marker({
        position, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: "北京"
      });
      map.setCenter(position);
      map.add(marker);
    }

    AMap.plugin(["AMap.Autocomplete", "AMap.PlaceSearch"], function() {
      // 实例化Autocomplete
      let autoOptions = {
        city: "北京",
        input: "address_input"
      };
      let autoComplete = new AMap.Autocomplete(autoOptions);

      AMap.event.addListener(autoComplete, "select", function(e) {
        //TODO 针对选中的poi实现自己的功能
        console.log(e);
        if (marker) map.remove(marker);
        let positionNew = new AMap.LngLat(
          e.poi.location.lng,
          e.poi.location.lat
        );
        marker = new AMap.Marker({
          position: positionNew, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          title: "北京"
        });
        map.setCenter(positionNew);
        map.add(marker);
        that.setState({ address: e.poi.name, position: e.poi.location });
      });
    });
  };

  componentDidMount() {
    const { address, position = { lng: 116, lat: 39 } } = this.props;
    console.log(address);
    if (address) {
      this.setState({ address, position }, function() {});
    }
    this.loadMap();
  }

  render() {
    return (
      <View className="map-wrapper">
        <View className="at-row search-wrapper">
          <View className="at-col at-col-9">
            <input
              id="address_input"
              type="text"
              autoFocus
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View className="at-col at-col-3">
            <Button
              type="primary"
              style={{ width: "100%", height: "100%" }}
              onClick={this.handleConfirm}
            >
              确定
            </Button>
          </View>
        </View>
        {/* 地图 */}
        <View id="map-container" />
        {/* 列表 */}
      </View>
    );
  }
}
