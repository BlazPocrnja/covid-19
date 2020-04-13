import React, { useEffect, useState } from 'react';
import './App.css';
import { Layout, Table, Input, Button, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import GlobeChart from './globeChart';
import GrowthLineChart from './growthLineChart';
import ConfirmedAreaChart from './confirmedAreaChart';
import { findLineByLeastSquares, linearRegression } from './myMath';
import { debounce } from 'lodash';

const { Content, Sider } = Layout;

function App() {
  const [data, setData] = useState({})
  const [tableData, setTableData] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [growthTrend, setGrowthTrend] = useState([])
  const [confirmedData, setConfirmedData] = useState([])
  const [predictedData, setPredictedData] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    fetch("https://pomber.github.io/covid19/timeseries.json")
      .then(response => response.json())
      .then(data => {
        let fixedData = {
          ...data,
          "United States": data["US"],
          "South Korea": data["Korea, South"]
        }
        delete fixedData["US"]
        delete fixedData["Korea, South"]
        setData(fixedData)
      }
      );
  }, [])

  useEffect(() => {
    let tableData = []
    for (let key in data) {
      tableData.push(
        {
          key: key,
          country: key,
          ...data[key][data[key].length - 1]
        }
      )
    }

    setTableData(tableData)
  }, [data])

  useEffect(() => {
    if (selectedCountry !== "") {
      const confirmedData = []
      const growthData = []
      for (let i = 0; i < data[selectedCountry].length; ++i) {
        let currDate = data[selectedCountry][i].date
        confirmedData.push({ date: new Date(currDate).getTime(), value: data[selectedCountry][i].confirmed })

        if (i >= 2) {
          let prevNewCases = data[selectedCountry][i - 1].confirmed - data[selectedCountry][i - 2].confirmed
          let currNewCases = data[selectedCountry][i].confirmed - data[selectedCountry][i - 1].confirmed
          let growthRate = prevNewCases === 0 ? 0 : currNewCases / prevNewCases
          growthData.push({ date: new Date(currDate).getTime(), value: growthRate })
        }
        else growthData.push({ date: new Date(currDate).getTime(), value: 0 })
      }

      setConfirmedData(confirmedData)
      setGrowthData(growthData)
    }
  }, [selectedCountry])

  const handleBrushChange = debounce(({ startIndex, endIndex }) => {
    const x_values = []
    const y_values = []
    for (let i = startIndex; i <= endIndex; ++i) {
      x_values.push(growthData[i].date)
      y_values.push(growthData[i].value)
    }

    const [results_x, results_y] = findLineByLeastSquares(x_values, y_values)
    const results = results_y.map((y, i) => ({ value: y, date: x_values[i] }))
    setGrowthTrend(results)

    const lr = linearRegression(x_values, y_values)

    const predictedData = []
    const currentDate = new Date();
    const selectedData = data[selectedCountry]
    let newCases = selectedData[endIndex].confirmed - selectedData[endIndex - 1].confirmed
    let totalCases = selectedData[endIndex].confirmed

    for (let i = 1; i <= 365; ++i) {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + i)

      const predictedGrowthRate = Math.max(lr.slope * nextDate.getTime() + lr.intercept, 0)
      newCases = newCases * predictedGrowthRate
      totalCases += newCases

      predictedData.push({date: nextDate.getTime(), predictedValue: totalCases})
    }

    setPredictedData(predictedData)
  }, 500)

  const getColumnSearchProps = (dataIndex, placeholder = dataIndex) => {
    let searchInput = undefined
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchText(selectedKeys[0])
    };

    const handleReset = clearFilters => {
      clearFilters();
      setSearchText("")
    };

    return ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              searchInput = node;
            }}
            placeholder={`Search ${placeholder}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.select());
        }
      },
      render: text => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      )
    });
  }

  const columns = [
    {
      title: 'Country',
      dataIndex: 'country',
      sorter: (a, b) => a.country.localeCompare(b.country),
      ...getColumnSearchProps('country', "countries"),
    },
    {
      title: 'Confirmed',
      dataIndex: 'confirmed',
      align: "right",
      sorter: (a, b) => a.confirmed - b.confirmed,
      defaultSortOrder: "descend",
      ...getColumnSearchProps('confirmed'),
    },
    {
      title: 'Deaths',
      dataIndex: 'deaths',
      align: "right",
      sorter: (a, b) => a.deaths - b.deaths,
      ...getColumnSearchProps('deaths'),
    },
    {
      title: 'Recovered',
      dataIndex: 'recovered',
      align: "right",
      sorter: (a, b) => a.recovered - b.recovered,
      ...getColumnSearchProps('recovered'),
    }
  ];

  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Content>
        <Modal
          bodyStyle={{ height: "95vh", overflow: 'scroll' }}
          width="95vw"
          centered
          visible={selectedCountry !== ""}
          footer={null}
          onCancel={() => setSelectedCountry("")}
        >
          <GrowthLineChart
            data={growthData}
            trendLine={growthTrend}
            handleBrushChange={handleBrushChange}
          />
          <ConfirmedAreaChart
            data={confirmedData}
            predictedData={predictedData}
          />
        </Modal>
        <GlobeChart
          data={data}
          onCountryClick={(country) => setSelectedCountry(country)}
        />
      </Content>
      <Sider
        width="35%"
        theme="light"
      >
        <Table
          size="small"
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ y: "calc(100vh - 87px)" }}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => setSelectedCountry(record.country)
            };
          }}
        />
      </Sider>
    </Layout>
  );
}

export default App;
