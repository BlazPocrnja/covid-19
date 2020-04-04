import React, { useEffect, useState } from 'react';
import './App.css';
import { Layout, Table, Input, Button, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import GlobeChart from './globeChart';
import LineChart from './lineChart';

const { Content, Sider } = Layout;

function App() {
  const [data, setData] = useState({})
  const [tableData, setTableData] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchText, setSearchText] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

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
    if (selectedCountry !== "") setModalVisible(!modalVisible)
  }, [selectedCountry])

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
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
        >
          <LineChart data={[{date: "2020/02/02", value: 1}]}/>
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
