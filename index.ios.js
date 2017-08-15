/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  View
} from 'react-native';

import { Header, Card, CardSection, Button } from './src/components/common/index';
import AnkiWebView from './src/components/AnkiWebView';


export default class Anki extends Component {

  constructor(props) {
    super(props);
    this.ankiWebView = null;
  }

  render() {
    return (

      <View style={{flex: 1}}>
        <Header headerText={'Anki-Voice'} />

        <Card>
          <CardSection>
            <Button onPress={() => {this.ankiWebView.sendStartMessage();}}>
              Start
            </Button>
            <Button onPress={() => {this.ankiWebView.sendStopMessage();}}>
              Stop
            </Button>
          </CardSection>
        </Card>
        
        <AnkiWebView ref={(ankiWebView) => {this.ankiWebView = ankiWebView}} />
      </View>
      
    );
  }
}

AppRegistry.registerComponent('Anki', () => Anki);
