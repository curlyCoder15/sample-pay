import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList
} from "react-native";
import { Overlay, Input, ButtonGroup } from "react-native-elements";
import axios from "axios";
import _ from "lodash";

export default class App extends React.Component {
  state = {
    expense: [],
    total: 0,
    visible: false,
    buttons: ["USD", "CAD", "INR"],
    selectedIndex: 1,
    description: "",
    amount: "0",
    cadAmount: 0,
    exchangeRate: {},
    submitDisable: false
  };

  setVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  updateIndex = value => {
    this.setState({ selectedIndex: value });
  };

  async findExchangeRate() {
    try {
      if (_.isEmpty(this.state.exchangeRate)) {
        var { data } = await axios.get(
          "https://api.exchangeratesapi.io/latest?base=CAD"
        );
        this.setState({ exchangeRate: data.rates });
        console.log("finding nemo");
      }
    } catch (e) {
      console.log("ERROR:", e);
    }
  }

  async setAmount(value) {
    await this.findExchangeRate();
    var amount = parseFloat(value);
    var cadAmount = 0;
    if (this.state.selectedIndex == 0) {
      //convert currency USD to CAD
      cadAmount = (amount / this.state.exchangeRate.USD).toFixed(2);
    } else if (this.state.selectedIndex == 2) {
      //convert currency INR to CAD
      cadAmount = (amount / this.state.exchangeRate.INR).toFixed(2);
    } else {
      cadAmount = amount;
    }
    var total = cadAmount + this.state.total;
    if (total > 1000) {
      this.setState({
        submitDisable: true,
        amount: amount.toString(),
        cadAmount
      });
      alert("The total cannot be more than 1000 dollars");
    } else
      this.setState({
        amount: amount.toString(),
        submitDisable: false,
        cadAmount
      });
  }

  async submit() {
    {
      var arr = this.state.expense;
      var length = arr.length;
      var total =
        parseFloat(this.state.total) + parseFloat(this.state.cadAmount);

      arr.push({
        index: this.state.expense.length + 1,
        description: this.state.description,
        amount: this.state.amount,
        amountCad: this.state.cadAmount,
        curr:
          this.state.selectedIndex == 0
            ? "USD"
            : this.state.selectedIndex == 1
            ? "CAD"
            : "INR"
      });
      console.log("submitted item", _.last(arr));
      this.setState({
        expense: arr,
        description: "",
        amount: "0",
        visible: false,
        total: total,
        cadAmount: 0
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          {this.state.expense.length < 5 && (
            <TouchableOpacity
              style={{ padding: 5, borderWidth: 1, alignItems: "center" }}
              onPress={() => this.setState({ visible: !this.state.visible })}
            >
              <Text style={{ fontSize: 20 }}>Add Receipt</Text>
            </TouchableOpacity>
          )}
          <Overlay
            isVisible={this.state.visible}
            windowBackgroundColor="rgba(255, 255, 255, .8)"
            overlayBackgroundColor="white"
            width="90%"
            height="auto"
            overlayStyle={{ borderWidth: 1, borderColor: "#eee" }}
          >
            <View>
              <Text style={{ fontSize: 25 }}>Add Receipt Information</Text>
              <View>
                <Input
                  placeholder="Description"
                  value={this.state.description}
                  onChangeText={text => this.setState({ description: text })}
                />
                <ButtonGroup
                  onPress={this.updateIndex}
                  selectedIndex={this.state.selectedIndex}
                  buttons={this.state.buttons}
                  containerStyle={{ height: 40, marginVertical: 5 }}
                />
                <Input
                  placeholder="Amount"
                  value={this.state.amount}
                  onChangeText={text => this.setAmount(text)}
                />
                <TouchableOpacity
                  disabled={this.state.submitDisable}
                  style={styles.button}
                  onPress={() => this.submit()}
                >
                  <Text>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Overlay>
          <View style={{ margin: 10, padding: 10 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 30 }}>Expense Report</Text>
              <Text style={{ fontSize: 20 }}>Total: {this.state.total}</Text>
            </View>
            <FlatList
              data={this.state.expense}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.itemContainer}>
                    <Text style={{ flex: 3, fontSize: 18 }}>
                      {index + 1}. {item.description}
                    </Text>

                    <Text style={{ flex: 2, fontSize: 18 }}>
                      {item.amountCad} $CAD
                    </Text>
                  </View>
                );
              }}
              keyExtractor={item => item.index.toString()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40, padding: 20 },
  itemContainer: {
    marginTop: 10,
    borderWidth: 1,
    width: "100%",
    flexDirection: "row",
    padding: 10
  },
  button: {
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    marginVertical: 20
  }
});
