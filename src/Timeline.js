'use strict';

import React, {Component} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import moment from 'moment';

export default class Timeline extends Component {
  _panResponder;
  point = new Animated.ValueXY();
  scrollOffset = 0;
  currentIdx = -1;

  constructor(props) {
    super(props);
    const {dates, blocks} = props;
    this.state = {
      dates: dates,
      blocks: blocks,
      dragging: false,
      selectedBlockIndex: -1,
    };
    this.pan = [];
    this.currentPanValue = [];
    this.panListener = [];
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      //imp
      onPanResponderGrant: (evt, gestureState) => {
        console.log('onPanResponderGrant Called');
        console.log(JSON.stringify(gestureState));
        this.currentIdx = this.getSelectedBlock(
          gestureState.x0,
          gestureState.y0,
        );
        this.setState({
          dragging: true,
          selectedBlockIndex: this.currentIdx,
        });
      },
      //imp
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([{y: this.point.y}])({y: gestureState.moveY});
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded

        //send moved block index with gesture state required details
        this.setState({
          dragging: false,
          selectedBlockIndex: -1,
        });
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  render() {
    const {dates, blocks} = this.props;
    return (
      <ScrollView
        style={styles.container}
        onScroll={e => {
          this.scrollOffset = e.nativeEvent.contentOffset.y;
          console.log(`Y Scrolled : ${this.scrollOffset}`);
        }}
        scrollEventThrottle={50}>
        <View style={styles.listview}>
          <FlatList
            scrollEnabled={!this.state.dragging}
            data={dates}
            renderItem={this.renderItem}
            keyExtractor={(item, key) => item.toString() + key}
            onLayout={e => {
              console.log('ON Laayout Called');
              console.log(JSON.stringify(e.nativeEvent));
            }}
          />
        </View>
        <View style={styles.blockView}>
          {this.state.dragging && (
            <Animated.View
              style={{
                top: this.point.getLayout().top,
                marginVertical: this.scrollOffset,
                width: '100%',
                zIndex: 1,
                position: 'absolute',
              }}>
              {this.renderBlock(
                blocks[this.state.selectedBlockIndex],
                this.state.selectedBlockIndex,
                false,
              )}
            </Animated.View>
          )}
          {blocks.map((block, index) => this.renderBlock(block, index, true))}
        </View>
      </ScrollView>
    );
  }

  renderItem = ({item, index}) => {
    return (
      <View style={styles.rowContainer}>
        <View style={styles.timeContainer}>
          {0 != index && this.renderTime(item, index)}
        </View>
        <View style={styles.lineVerticalContainer}></View>
        <View style={styles.lineRowContainer}>
          {0 != index ? this.renderLineRow(item, index) : null}
        </View>
      </View>
    );
  };

  renderTime = (item, index) => {
    return (
      <Text key={`${item}--${index}`} style={styles.time}>
        {item}
      </Text>
    );
  };

  renderLineVertical = (item, index) => {
    return <View style={styles.lineVertical}></View>;
  };

  renderLineRow = () => {
    return <View style={styles.lineRow}></View>;
  };

  getSelectedBlock = (x0, y0) => {
    var blocks = this.state.blocks;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var blockDimenstion = this.getTopAndHeight(block);
      var clickedPoint = this.scrollOffset + y0;
      if (
        clickedPoint >= blockDimenstion.top &&
        clickedPoint <= blockDimenstion.top + blockDimenstion.height
      ) {
        return i;
      }
    }
    return -1;
  };
  getTopAndHeight = block => {
    let startTime = moment(block.startTime);
    let startHour = startTime.hour();
    let startMinutes = startTime.minutes();
    let totalStartMinute = startHour * 60 + startMinutes;
    let top = (totalStartMinute * 50) / 60;

    let endTime = moment(block.endTime);
    let endHour = endTime.hour();
    let endMinutes = endTime.minutes();
    let totalEndMinute = endHour * 60 + endMinutes;
    let durationInMinutes = totalEndMinute - totalStartMinute;
    let height = (durationInMinutes * 50) / 60;
    return {
      top: top,
      height: height,
    };
  };

  renderBlock = (block, index, forceTop) => {
    var blockDimenstion = this.getTopAndHeight(block);
    return (
      <View
        {...this._panResponder.panHandlers}
        key={index}
        style={[
          styles.block,
          {
            top: forceTop ? blockDimenstion.top : 0,
            height: blockDimenstion.height,
            opacity:
              this.state.selectedBlockIndex > -1 &&
              this.state.selectedBlockIndex === index &&
              forceTop
                ? 0.6
                : 1,
          },
        ]}>
        <Text style={styles.blockName}>{block.name}</Text>
      </View>
    );
  };

  getPanResponder(index) {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.pan[index].x,
          dy: this.pan[index].y,
        },
      ]),
      onPanResponderRelease: (e, gesture) => {
        this.pan[index].setOffset({
          x: this.currentPanValue[index].x,
          y: this.currentPanValue[index].y,
        });
        this.pan[index].setValue({x: 0, y: 0});
      },
    });
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listview: {
    flex: 1,
  },
  blockView: {
    flex: 1,
    position: 'absolute',
    width: '80%',
    marginLeft: '15%',
    marginRight: '5%',
  },
  block: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(192,192,192, 1 )',
    borderRadius: 15,
    borderColor: 'black',
    borderWidth: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockName: {},

  rowContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 50,
  },
  timeContainer: {
    width: '10%',
  },
  lineVerticalContainer: {
    borderRightWidth: 1,
    width: '5%',
    borderRightColor: '#DAE1E7',
  },
  lineRowContainer: {
    width: '100%',
    marginLeft: '12%',
    position: 'absolute',
  },

  time: {
    textAlign: 'right',
    marginVertical: -7,
    fontSize: 11,
    color: '#121010',
    opacity: 0.6,
  },
  lineRow: {
    flex: 1,
    backgroundColor: 'rgba(192,192,192,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#DAE1E7',
  },
});
