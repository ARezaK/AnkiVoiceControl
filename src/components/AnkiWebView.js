import React, { Component } from 'react';
import { StyleSheet, View, Text, WebView } from 'react-native';

import { Card, CardSection, Spinner } from './common/index';
import Tts from 'react-native-tts';
import Voice from 'react-native-voice';
import KeepAwake from 'react-native-keep-awake';

const EMULATE_VOICE = false; // if you set this to true then voice commands wont work

class AnkiWebView extends Component {
  
  onSpeechStart(e) {
    this.setState({
      speechStarted: true,
      speechRecognized: false,
    });
  }
  onSpeechRecognized(e) {
    this.setState({
      speechRecognized: true,
    });
  }
  onSpeechEnd(e) {
    this.setState({
      speechStarted: false,
    });
  }
  onSpeechError(e) {
    this.setState({
      speechError: e.error,
    });
  }
  onSpeechResults(e) {
    this.setState({
      speechResults: e.value,
    });
    // parsing...
    this.parseVoice(e.value);
  }
  onSpeechPartialResults(e) {
    this.setState({
      speechPartialResults: e.value,
    });
  }
  onSpeechVolumeChanged(e) {
    this.setState({
      speechPitch: e.value,
    });
  }

  speech_startRecognizing(e, test_emulated_recog_str) {
    console.log("zzz " + 'start recognition....');
    this.setState({
      speechRecognized: false,
      speechPitch: '',
      speechError: '',
      speechStarted: false,
      speechResults: [],
      speechPartialResults: [],
    });
    const error = Voice.start('en-US');
    if (EMULATE_VOICE) {
      this.onSpeechResults({ value: [test_emulated_recog_str] });
    }
  }
  speech_stopRecognizing(e) {
    console.log("zzz " + 'stop recognition');
    const error = Voice.stop();
  }
  speech_cancelRecognizing(e) {
    const error = Voice.cancel();
  }
  speech_destroyRecognizer(e) {
    this.setState({
      speechRecognized: false,
      speechPitch: '',
      speechError: '',
      speechStarted: false,
      speechResults: [],
      speechPartialResults: [],
    });
    const error = Voice.destroy();
  }

  componentWillUnmount() {
    const error = Voice.destroy();
    if (Voice.onSpeechStart != null) {
      Voice.onSpeechStart.remove();
      Voice.onSpeechStart = null;
    }
    if (Voice.onSpeechRecognized != null) {
      Voice.onSpeechRecognized.remove();
      Voice.onSpeechRecognized = null;
    }
    if (Voice.onSpeechEnd != null) {
      Voice.onSpeechEnd.remove();
      Voice.onSpeechEnd = null;
    }
    if (Voice.onSpeechError != null) {
      Voice.onSpeechError.remove();
      Voice.onSpeechError = null;
    }
    if (Voice.onSpeechResults != null) {
      Voice.onSpeechResults.remove();
      Voice.onSpeechResults = null;
    }
    if (Voice.onSpeechPartialResults != null) {
      Voice.onSpeechPartialResults.remove();
      Voice.onSpeechPartialResults = null;
    }
    if (Voice.onSpeechVolumeChanged != null) {
      Voice.onSpeechVolumeChanged.remove();
      Voice.onSpeechVolumeChanged = null;
    }
  }

  constructor(props) {
    super(props);
    this.progressing = false,
    this.state = {
      loading: true,
      speechRecognized: false,
      speechPitch: '',
      speechError: '',
      speechStarted: false,
      speechResults: [],
      speechPartialResults: [],
    };
    this.ankiWebView = null;
    this.jsCode = `
      document.addEventListener("message", function(event) {
        switch (event.data) {
          case "start":
            setTimeout(start, 500);
            break;
          case "show_answer":
            show_answer(); break;
          case "deliver_answer":
            deliver_answer(); break;
          case "1":
            click_qa_level(1); break;
          case "2":
            click_qa_level(2); break;
          case "3":
            click_qa_level(3); break;
          case "4":
            click_qa_level(4); break;
          default:
            window.postMessage("WebView-Unexpected-MSG", "*"); break;
        }
      });
    
      function stripHtml(html) {
        var temporalDivElement = document.createElement("div");
        temporalDivElement.innerHTML = html;
        var text = (temporalDivElement.textContent || temporalDivElement.innerText || "");
        temporalDivElement.remove();
        return text;
      }

      function start() {
        // when 'studynow' button show, simulate click...
        var div_overview = document.getElementById('overview');
        if (div_overview !== null && div_overview.style.display != "none") {
          var btn_studynow = document.getElementById('studynow');
          if (btn_studynow !== null) {
            btn_studynow.onclick();
          }
          return;
        }

        // when 'ansbuta' button show...
        var div_quiz = document.getElementById('quiz');
        if (div_quiz !== null && div_quiz.style.display != "none") {
          // find qa
          var div_qa = document.getElementById('qa');
          var hr_answer = document.getElementById('answer');
          if (div_qa !== null && hr_answer === null) {
            var text = div_qa.textContent;
            if (text.startsWith(".card {")) {
              var index = text.indexOf("}");
              text = text.substr(index+1);
            }
            window.postMessage(text, "*");
          }
          return;
        }
      }

      function show_answer() {
        var btn_ansbuta = document.getElementById('ansbuta');
        if (btn_ansbuta !== null) {
          btn_ansbuta.onclick();
          setTimeout(function(msg){window.postMessage(msg,"*")}, 500, "clicked_show_answer");
        }
      }

      function deliver_answer() {
        var div_quiz = document.getElementById('quiz');
        if (div_quiz !== null && div_quiz.style.display != "none") {
          // find qa
          var div_qa = document.getElementById('qa');
          var hr_answer = document.getElementById('answer');
          if (div_qa !== null && hr_answer !== null) {
            var tmp = div_qa.innerHTML;
            var index = tmp.indexOf('<hr id="answer"');
            tmp = tmp.substr(index);
            var text = "deliver_answer:" + stripHtml(tmp);
            window.postMessage(text, "*");
            return;
          }
        }
        window.postMessage("No answer", "*");
      }

      function click_qa_level(level) {
        var easeId = "ease" + level;
        var btn_ease = document.getElementById(easeId);
        if (btn_ease === null && level == 4) {
          easeId = "ease" + 3;
          btn_ease = document.getElementById(easeId);
        }
        if (btn_ease !== null) {
          btn_ease.onclick();
          setTimeout(function(msg){window.postMessage(msg,"*")}, 500, "clicked_qa_level");
        } else {
          setTimeout(function(msg){window.postMessage(msg,"*")}, 500, "notfound_qa_level");
        }
      }
    `;

    this.tts_answer = "";
    Tts.setDefaultLanguage('en-IE');
    Tts.setDefaultVoice('com.apple.ttsbundle.Moira-compact');
    Tts.setDefaultRate(0.45);
    // Tts.setDefaultPitch(1.5);
    Tts.addEventListener('tts-start', (event) => console.log("zzz " + "tts-start", event));
    Tts.addEventListener('tts-cancel', (event) => console.log("zzz " + "tts-cancel", event));
    Tts.addEventListener('tts-finish', (event) => {
      console.log("zzz " + "tts-finish", event);
      if (this.tts_answer != "") {  // after speaking [answer]
        this.tts_answer = "";
        this.speech_startRecognizing(null, "two");
      } else {  // after speaking [question]
        this.speech_startRecognizing(null, "read");
      }
    });

    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);
  }

  parseVoice(results) {
    var i = results.length - 1;
    const recogResult = results[i].toLowerCase();
    console.log("zzz recogResult: " + recogResult);
    const recogResultArray = recogResult.split(" ");
    i = recogResultArray.length - 1;
    const lastWord = recogResultArray[i];
    console.log("zzz lastWord: " + lastWord);
    switch (lastWord) {
      case "1":
      case "one":
        this.sendPostMessage("1");
        break;
      case "2":
      case "two":
      case "to":
        this.sendPostMessage("2");
        break;
      case "3":
      case "three":
        this.sendPostMessage("3");
        break;
      case "4":
      case "four":
      case "for":
        this.sendPostMessage("4");
        break;
      case "read":
        this.speech_stopRecognizing(null);
        this.speech_destroyRecognizer(null);
        this.sendPostMessage("show_answer");
        break;
      default:
        break;
    }
  }

  onMessage(event) {
    var msg = event.nativeEvent.data;
    console.log("zzz " + "onMessage(): Received Message from WebView : ", msg);
    if (msg == "WebView-Unexpected-MSG") {
      return;
    }

    if (msg == "clicked_show_answer") {
      this.sendPostMessage("deliver_answer");
      return;
    }

    if (msg == "clicked_qa_level") {
      this.speech_stopRecognizing(null);
      this.speech_destroyRecognizer(null);
      if (this.progressing) { // when no click 'stop' button.
        this.sendStartMessage();
      }
      return;
    }

    if (msg == "notfound_qa_level") {
      return;
    }

    if (msg.indexOf("deliver_answer:") == 0) {
      var text = msg.substr(15);
      this.tts_answer = text;
      Tts.speak(this.tts_answer);
      return;
    }

    // when qa-text, text2speech.
    console.log("zzz " + "QA-text: " + msg);
    Tts.speak(msg);
  }

  sendStartMessage() {
    // console.log("zzz " + "Clicked Start Button");
    this.progressing = true;
    this.sendPostMessage("start");
  }

  sendStopMessage() {
    // console.log("zzz " + "Clicked Stop Button");
    this.speech_stopRecognizing();
    this.speech_destroyRecognizer();
    this.progressing = false;
  }

  sendPostMessage(msg) {
    console.log("zzz " + "sendPostMessage() RN --> WebView : " + msg);
    this.ankiWebView.postMessage(msg);
  }

  onLoadStart() {
    // console.log("zzz " + "onLoadStart()");
    this.setState({
      loading: true,
    });
  }

  onLoadEnd() {
    // console.log("zzz " + "onLoadEnd()");
    this.setState({
      loading: false,
    });
  }

  onNavigationStateChange(webViewState) {
    // console.log("zzz " + "URL -> ", webViewState.url);
  }

  renderSpinner() {
    if (this.state.loading) {
      return <Spinner size="small" />;
    } else {
      return <Text style={styles.instructions}>Press the buttons and start(stop) speaking.</Text>;
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Card>
          <CardSection>
            {this.renderSpinner()}
          </CardSection>
        </Card>
        <WebView
            source={{uri: 'https://ankiweb.net'}}
            style={{marginTop: 10, flex: 1}}
            javaScriptEnabled = {true}
            domStorageEnabled = {true}
            startInLoadingState={false}
            onLoadStart={this.onLoadStart.bind(this)}
            onLoadEnd={this.onLoadEnd.bind(this)}
            onNavigationStateChange={this.onNavigationStateChange.bind(this)}
            injectedJavaScript={this.jsCode}          
            ref={(webView) => {this.ankiWebView = webView}}
            onMessage={this.onMessage.bind(this)} />
        <KeepAwake />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  status: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
});

export default AnkiWebView;
