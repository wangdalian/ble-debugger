<template>
  <div id="app" v-cloak>
    <el-container style="height: 100%">
      <el-header style="height: 67px; width: 100%;
          background-color: #212637;
          color: #fff;
          vertical-align: middle;
          line-height: 67px;
          border-bottom: 1px solid #1e2946;
          position: fixed;
          z-index: 999;
          ">
        <span style="width: 80px; text-align: center; ">
            <img :src="require('./assets/img/cassia.png')" style="vertical-align: middle; width: 38px; height: 38px; margin-top: -10px;"></img>
        </span>
        <span style="font-size: 22px;">
        Cassia 蓝牙调试工具</span>
        <span style="float: right;">Language
          <el-select v-model="store.devConfDisplayVars.language" size="small" style="width: 120px; padding-right: 15px;">
            <el-option label="中文" value="中文"></el-option>
            <el-option label="English" value="English"></el-option>
          </el-select>   
        </span>
      </el-header>
      <el-container>
        <el-aside style="width: 350px; border-right: 1px solid #f2f2f2; background-color: #fff; height: 100%; position: fixed; z-index: 999; top: 75px; 
          z-index: 3;" v-show="this.store.devConfDisplayVars.isConfigMenuItemOpen">
          <el-container style="height: 100%; width: 100%;">
            <el-main>
              <el-form label-width="80px" size="small">
              <el-row style="font-size: 16px; border-bottom: 1px solid #ddd; margin-top: 30px;">
                <span>配置连接配置</span>
              </el-row>
              <el-form-item label="连接方式" style="margin-top: 15px;">
                <el-select v-model="store.devConf.controlStyle" style="width: 100%">
                  <el-option label="ap" value="ap"></el-option>
                  <el-option label="ac" value="ac"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="服务URL" style="margin-top: 15px;">
                <el-input v-model="store.devConf.serverURI" class="server-ip" clearable placeholder="http://192.168.0.100"></el-input>
              </el-form-item>
              <el-form-item label="开发账号" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.acDevKey" class="ac-dev-key"></el-input>
              </el-form-item>
              <el-form-item label="开发密码" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.acDevSecret" class="ac-dev-secret"></el-input>
              </el-form-item>
              <el-form-item label="AP MAC" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.mac" class="ap-mac" placeholder="CC:1B:E0:E0:DD:70"></el-input>
              </el-form-item>
              <el-row style="font-size: 16px; border-bottom: 1px solid #ddd; margin-top: 50px;">
                <span>配置扫描参数</span>
              </el-row>
              <el-form-item label="使用芯片" style="margin-top: 15px;">
                <el-select v-model="store.devConf.chip" style="width: 100%">
                  <el-option label="0" value="0"></el-option>
                  <el-option label="1" value="1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="过滤名称" style="margin-top: 15px;">
                <el-select v-model="store.devConf.filter_name" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                </el-select>
              </el-form-item>
              <el-form-item label="过滤MAC">
                <el-select v-model="store.devConf.filter_mac" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                </el-select>
              </el-form-item>
              <el-form-item label="过滤RSSI">
                <el-slider
                    v-model="store.devConf.filter_rssi"
                    :min="-85"
                    :max="0">
                  </el-slider>
              </el-form-item>
              </el-form>
            </el-main>
            <el-footer style="background-color: #f4f5f6; width: 350px; height: 50px; line-height: 50px; vertial-align: middle; text-align: center; position: fixed; bottom: 0; left: 0;">
              <el-button type="danger" size="small" style="margin-right: 20px;">重启 AP</el-button>
              <el-button type="primary" size="small" @click="startScan" v-show="!store.devConfDisplayVars.isScanning">开始扫描</el-button>
              <el-button type="danger" size="small" @click="stopScan" v-show="store.devConfDisplayVars.isScanning">停止扫描</el-button>
            </el-footer>
          </el-container>
        </el-aside>
        <el-main :style="{'background-color': '#fff', 'padding': 0, 'margin-left': this.store.devConfDisplayVars.isConfigMenuItemOpen ? '350px' : '0px', 'margin-top': '67px'}">
          <el-container style="height: 100%; background-color: #fff">
            <el-aside width="80px" style="height: 100%; background-color: #fff; position: fixed; z-index: 999;">
              <el-menu
                collapse
                @select="menuSelect"
                background-color="#212637"
                text-color="#ffffff"
                active-text-color="#2897ff"
                default-active="scanListMenuItem"
                class="el-menu-vertical-demo">
                <el-menu-item index="configMenuItem">
                  <i class="el-icon-s-fold" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">配置参数</span>
                </el-menu-item>
                <el-menu-item index="scanListMenuItem">
                  <i class="el-icon-search" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">扫描列表</span>
                </el-menu-item>
                <el-menu-item index="connectListMenuItem">
                  <i class="el-icon-connection" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">连接列表</span>
                </el-menu-item>
                <el-menu-item index="notifyListMenuItem">
                  <i class="el-icon-message-solid" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">通知列表</span>
                </el-menu-item>
                <el-menu-item index="apiLogListMenuItem">
                  <i class="el-icon-s-order" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">接口日志</span>
                </el-menu-item>
                <el-menu-item index="apiDebuggerMenuItem">
                  <i class="el-icon-service" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">接口调试</span>
                </el-menu-item>
                <el-menu-item index="apiDemoMenuItem">
                  <i class="el-icon-magic-stick" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">场景示例</span>
                </el-menu-item>
                <el-menu-item index="toolsMenuItem">
                  <i class="el-icon-s-tools" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">常用工具</span>
                </el-menu-item>
              </el-menu>
            </el-aside>
            <el-main style="height: 100%; margin-left: 80px;">
              <el-tabs style="background-color: #fff"	@tab-click="scanTabsClick" v-show="store.devConfDisplayVars.activeMenuItem === 'scanListMenuItem'">
                <el-tab-pane style="height: 100%; background-color: #fff; " >
                  <span slot="label"><i class="el-icon-s-data"></i> 扫描结果</span>
                  <vxe-toolbar>
                    <template v-slot:buttons>
                      <span>设备数量: <span style="font-weight: bold; color: #409eff">{{ getComputedScanDisplayResultList.length }} </span></span>
                      <vxe-input v-model="cache.scanDisplayFilterContent" type="search" placeholder="搜索mac或name" size="small"></vxe-input>
                      <vxe-button @click="scanDisplayResultExport" status="primary" size="small">导出</vxe-button>
                      <vxe-button @click="scanDisplayResultClear" status="danger" size="small">清空</vxe-button>
                    </template>
                  </vxe-toolbar>
                  <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                  <vxe-grid 
                    border="none"
                    show-overflow
                    stripe
                    highlight-hover-row
                    :header-row-style="{'background-color': '#f4f5f6'}"
                    height="560px"
                    ref="refScanDisplayResultGrid"
                    :sort-config="{trigger: 'cell'}"
                    :data="getComputedScanDisplayResultList">
                    <vxe-table-column field="name" title="NAME" type="html" width="25%" sortable></vxe-table-column>
                    <vxe-table-column field="mac" title="MAC" type="html" width="30%" show-overflow></vxe-table-column>
                    <vxe-table-column field="bdaddrType" title="类型" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="rssi" title="信号" width="15%" sortable></vxe-table-column>
                    <!-- 暂时不显示广播包了，没有找到合适位置，上面的字段自定义slot，数据量大的话会卡顿 -->
                    <!-- <vxe-table-column field="adData" title="广播包" :width="store.devConfDisplayVars.adDataWidth" show-overflow></vxe-table-column> -->
                    <vxe-table-column title="操作" width="15%">
                      <template v-slot="{ row }">
                        <vxe-button status="primary" size="small" @click="connectDeviceByRow(row, row.mac)" :loading="cache.devicesConnectLoading[row.mac]">连接</vxe-button>
                      </template>
                    </vxe-table-column>
                  </vxe-grid>
                </el-tab-pane>
                <el-tab-pane style="width: 100%;">
                  <span slot="label"><i class="el-icon-pie-chart"></i> RSSI图表</span>
                  <el-row>
                    <el-form inline size="small">
                      <el-form-item label="统计周期">
                        <el-select v-model="store.devConfDisplayVars.rssiChartPeriod" placeholder="统计周期" style="width: 100px;">
                          <el-option label="60秒" value="60"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="统计间隔">
                        <el-select v-model="store.devConfDisplayVars.rssiChartDataSpan" placeholder="统计间隔" @change="rssiChartDataSpanChange" style="width: 100px;">
                          <el-option label="200毫秒" value="200"></el-option>
                          <el-option label="500毫秒" value="500"></el-option>
                          <el-option label="1秒" value="1000"></el-option>
                          <el-option label="2秒" value="2000"></el-option>
                          <el-option label="5秒" value="5000"></el-option>
                          <el-option label="10秒" value="10000"></el-option>
                          <el-option label="30秒" value="30000"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item>
                        <el-button v-show="!store.devConfDisplayVars.rssiChartSwitch" size="small" @click="destoryAndCreateRssiChart" type="primary">开启</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch && !store.devConfDisplayVars.rssiChartStopped" size="small" @click="stopRssiChart" type="primary">暂停</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch && store.devConfDisplayVars.rssiChartStopped" size="small" @click="startRssiChart" type="primary">继续</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch" size="small" @click="destoryRssiChart" type="primary">关闭</el-button>
                      </el-form-item>
                    </el-form>
                  </el-row>
                  <v-chart :options="chartOptions" ref="rssiChart" :autoresize="true" style="width: 100%; height: 500px; "></v-chart>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-model="cache.currentConnectedTab" @tab-remove="connectedListTabRemove" v-show="store.devConfDisplayVars.activeMenuItem === 'connectListMenuItem'">
                <el-tab-pane :closable="false">
                  <span slot="label"><i class="el-icon-s-data"></i> 连接列表</span>
                  <vxe-toolbar>
                    <template v-slot:buttons>
                      <span>已连接设备: <span style="font-weight: bold; color: #409eff">{{ getComputedConnectDisplayResultList().length }} </span></span>
                      <vxe-input v-model="cache.connectDisplayFilterContent" type="search" placeholder="搜索mac或name" size="small"></vxe-input>
                      <vxe-button @click="connectDisplayResultExport" status="primary" size="small">导出</vxe-button>
                      <vxe-button status="danger" size="small">清空</vxe-button>
                      <vxe-button status="danger" size="small">全部关闭</vxe-button>
                    </template>
                  </vxe-toolbar>
                  <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                  <vxe-grid 
                    border="none"
                    show-overflow
                    stripe
                    highlight-hover-row
                    height="560px"
                    :header-row-style="{'background-color': '#f4f5f6'}"
                    ref="refConnectDisplayResultGrid"
                    :sort-config="{trigger: 'cell'}"
                    :data="getComputedConnectDisplayResultList()">
                    <vxe-table-column field="name" title="名称" type="html" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="mac" title="地址" type="html" width="20%" show-overflow></vxe-table-column>
                    <vxe-table-column field="chip" title="芯片" type="html" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="bdaddrType" title="类型" width="15%" sortable></vxe-table-column>
                    <vxe-table-column title="操作" width="35%">
                      <template v-slot="{ row }">
                        <el-button-group>
                          <el-button type="primary" size="small" @click="getDeviceServices(row.mac)">服务</el-button>
                          <el-button type="primary" size="small" @click="disconnectDevice(row.mac)">断连</el-button>
                          <el-button type="primary" size="small">配对</el-button>
                          <el-button type="primary" size="small">取消配对</el-button>
                          <el-button type="primary" size="small" @click="exportDeviceServices(device.mac)">导出</el-button>
                        </el-button-group>
                      </template>
                    </vxe-table-column>
                  </vxe-grid>
                </el-tab-pane>
                <el-tab-pane :closable="true" v-for="(device, index) in cache.connectedList" :key="device.mac" :name="device.mac">
                  <span slot="label"><i class="el-icon-connection"></i> {{ device.mac }}</span>
                  <el-row style="background-color: #409eff; font-size: 14px; font-style: normal; border-radius: 3px; color: #fff; height: 60px; display: flex; align-items: center; padding-left: 15px; padding-right: 15px;">
                    <el-col :span="6">
                      <el-row>{{ device.name }}</el-row>
                      <el-row style="font-style:normal">{{ device.mac }}</el-row>
                    </el-col>
                    <el-col :span="3">{{ device.bdaddrType }}</el-col>
                    <el-col :span="3">chip{{ device.chip }}</el-col>
                    <el-col :span="12">
                      <el-button-group style="float: right; ">
                        <el-button size="small" @click="getDeviceServices(device.mac)" style="color: #2897ff">服务</el-button>
                        <el-button size="small" @click="disconnectDevice(device.mac)" style="color: #2897ff">断连</el-button>
                        <el-button size="small" style="color: #2897ff">配对</el-button>
                        <el-button size="small" style="color: #2897ff">取消配对</el-button>
                        <el-button size="small" @click="exportDeviceServices(device.mac)" style="color: #2897ff">导出</el-button>
                      </el-button-group>
                    </el-col>
                  </el-row>
                  <el-row style="padding-left: 0px; margin-top: 15px; ">
                    <el-collapse>
                      <el-collapse-item v-for="(service, index) in cache.devicesServiceList[device.mac]" :key="service.uuid">
                        <template slot="title">
                          <el-col style="padding-left: 5px; font-size: 14px; font-style: normal;">{{ service.uuid }}</el-col>
                          <el-col style="float: right; font-size: 14px; font-style: normal;">{{ service.name }}</el-col>
                        </template>
                        <el-row style="background-color: #e6e6e6; padding: 15px; border-bottom: 1px solid #fff" v-for="(char, index) in service.characteristics" title="char.name" :key="char.uuid">
                          <el-row style="font-size: 14px; font-weight: bold; font-style: normal;">{{ char.name }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal;">UUID: {{ char.uuid }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal;">HANDLE: {{ char.handle }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal; ">
                            Properties: 
                            <el-button-group>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('READ')" type="primary" size="small" @click="propertyClick('READ', device.mac, char)">
                                READ
                              </el-button>
                              <el-button style="font-style: normal; font-weight: bold;" v-bind:type="char.notifyStatus === 'on' ? 'primary' : 'info'" v-show="char.propertiesStr.includes('NOTIFY')" size="small" @click="propertyClick('NOTIFY', device.mac, char)">
                                NOTIFY
                              </el-button>
                              </el-switch>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('WRITE NO RES')" type="primary" size="small" @click="propertyClick('WRITE NO RES', device.mac, char)">
                                WRITE NO RES
                              </el-button>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('WRITE')" type="primary" size="small" @click="propertyClick('WRITE', device.mac, char)">
                                WRITE
                              </el-button>
                            </el-button-group>
                            <el-radio-group v-show="char.propertiesStr.includes('WRITE') || char.propertiesStr.includes('WRITE NO RES')" style="float: right" size="small" v-model="char.writeValueType">
                              <el-radio-button label="hex">HEX</el-radio-button>
                              <el-radio-button label="text">TEXT</el-radio-button>
                            </el-radio-group>
                            <el-input v-show="char.propertiesStr.includes('WRITE') || char.propertiesStr.includes('WRITE NO RES')" style="width: 220px; float: right; font-size: 12px; font-style: normal;" size="small" v-model="char.writeValue" :placeholder="char.writeValueType === 'hex' ? '格式：aa00bb11cc22（支持空格）' : '格式：任意字符'">
                            </el-input>
                          </el-row>
                          <el-row style="font-size: 12px; font-style: normal; color: #409eff" v-show="char.readValue.toString().length !== 0">
                            Value: (0x) 
                            <el-popover trigger="click" width="600" placement="right">
                              <el-table :data="char.parsedReadValues" width="100%" stripe empty-text="暂未添加解析">
                                <el-table-column label="字段" width="180">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.name }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="解析" width="300">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.parsed }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="HEX(0x)" width="120">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.raw }}</span>
                                  </template>
                                </el-table-column>
                              </el-table>
                              <el-button slot="reference" type="text">
                                {{ char.readValue }}
                              </el-button>
                            </el-popover>
                          </el-row>
                        </el-row>
                      </el-collapse-item>
                    </el-collapse>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'notifyListMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-connection"></i> 通知列表</span>
                  <el-row>
                    <vxe-toolbar>
                      <template v-slot:buttons>
                        <span>收到通知: <span style="font-weight: bold; color: #409eff">{{ getComputedNotifyDisplayResultList.length }} </span></span>
                        <vxe-input v-model="cache.notifyDisplayFilterContent" type="search" placeholder="搜索mac" size="small"></vxe-input>
                        <vxe-button @click="openNotify" status="primary" size="small" v-show="!store.devConfDisplayVars.isNotifyOn">开启</vxe-button>
                        <vxe-button @click="closeNotify" status="danger" size="small" v-show="store.devConfDisplayVars.isNotifyOn">关闭</vxe-button>
                        <vxe-button @click="notifyDisplayResultExport" status="primary" size="small">导出</vxe-button>
                        <vxe-button @click="notifyDisplayResultClear" status="danger" size="small">清空</vxe-button>
                      </template>
                    </vxe-toolbar>
                    <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                    <vxe-grid 
                      border="none"
                      show-overflow
                      stripe
                      height="560px"
                      highlight-hover-row
                      :header-row-style="{'background-color': '#f4f5f6'}"
                      ref="refNotifyDisplayResultGrid"
                      :sort-config="{trigger: 'cell'}"
                      :data="getComputedNotifyDisplayResultList">
                      <vxe-table-column field="time" title="时间戳" type="html" width="20%" sortable></vxe-table-column>
                      <vxe-table-column field="mac" title="地址" type="html" width="30%" show-overflow></vxe-table-column>
                      <vxe-table-column field="handle" title="HANDLE" width="10%" ></vxe-table-column>
                      <vxe-table-column field="value" title="VALUE" width="40%" show-overflow></vxe-table-column>
                    </vxe-grid>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-model="store.devConfDisplayVars.activeApiTabName" v-show="store.devConfDisplayVars.activeMenuItem === 'apiDebuggerMenuItem'">
                <el-tab-pane name="scan">
                  <span slot="label"><i class="el-icon-search"></i> 扫描设备</span>
                  <el-form label-width="80px" style="margin-top: 15px;" size="small">
                    <el-form-item label="使用芯片">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].chip" size="small">
                        <el-radio-button :label="0">芯片0</el-radio-button>
                        <el-radio-button :label="1">芯片1</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="过滤名称">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].filter_name" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                      </el-select>
                    </el-form-item>
                    <el-form-item label="过滤MAC">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].filter_mac" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                      </el-select>
                    </el-form-item>
                    <el-form-item label="过滤RSSI">
                      <el-slider
                      v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].filter_rssi"
                      show-input
                      :min="-85"
                      :max="0">
                    </el-slider>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi" v-show="!store.devConfDisplayVars.isApiScanning">开始调试</el-button>
                        <el-button type="danger" size="small" @click="stopApiScan" v-show="store.devConfDisplayVars.isApiScanning">停止扫描</el-button>
                        <el-button type="primary" size="small" @click="genCode">生成代码</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="connect">
                  <span slot="label"><i class="el-icon-connection"></i> 连接设备</span>
                  <el-form label-width="80px" style="margin-top: 15px;" size="small">
                    <el-form-item label="使用芯片">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].chip" size="small">
                        <el-radio-button label="0">芯片0</el-radio-button>
                        <el-radio-button label="1">芯片1</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="地址类型">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].addrType" size="small">
                        <el-radio-button label="public">PUBLIC</el-radio-button>
                        <el-radio-button label="random">RANDOM</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="设备地址">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">开始调试</el-button>
                        <el-button type="primary" size="small" @click="genCode">生成代码</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="read">
                  <span slot="label"><i class="el-icon-reading"></i> 读取数据</span>
                  <el-form label-width="80px" style="margin-top: 15px;" size="small">
                    <el-form-item label="HANDLE">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].handle"></el-input>
                    </el-form-item>
                    <el-form-item label="设备地址">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">开始调试</el-button>
                        <el-button type="primary" size="small" @click="genCode">生成代码</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="write">
                  <span slot="label"><i class="el-icon-edit-outline"></i> 写入数据</span>
                  <el-form label-width="80px" style="margin-top: 15px;" size="small">
                    <el-form-item label="HANDLE">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].handle"></el-input>
                    </el-form-item>
                    <el-form-item label="VALUE">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].value"></el-input>
                    </el-form-item>
                    <el-form-item label="写入方式">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].noresponse" size="small">
                        <el-radio-button label="false">等待</el-radio-button>
                        <el-radio-button label="true">不等待</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="设备地址">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">开始调试</el-button>
                        <el-button type="primary" size="small" @click="genCode">生成代码</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="disconnect">
                  <span slot="label"><i class="el-icon-scissors"></i> 断开连接</span>
                  <el-form label-width="80px" style="margin-top: 15px;" size="small">
                    <el-form-item label="设备地址">
                      <el-input v-model="store.devConfDisplayVars.apiDebuggerParams[store.devConfDisplayVars.activeApiTabName].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">开始调试</el-button>
                        <el-button type="primary" size="small" @click="genCode">生成代码</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-model="store.devConfDisplayVars.activeApiOutputTabName" v-show="store.devConfDisplayVars.activeMenuItem === 'apiDebuggerMenuItem'">
                <el-tab-pane name="output">
                  <span slot="label"><i class="el-icon-circle-check"></i> 调试结果</span>
                  <!--
                  <el-button-group>
                    <el-button size="small" type="primary" @click="exportApiOutputDisplay">导出</el-button>
                    <el-button size="small" type="danger" @click="clearApiOutputDisplay">清空</el-button>
                  </el-button-group>
                  -->
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.activeApiTabName === 'scan'" v-infinite-scroll="loadApiDebuggerResult" infinite-scroll-distance="20px" :infinite-scroll-disabled="cache.isApiDebuggerLoading">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].displayResultList.join('\n') }}
                  </highlight-code>
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.activeApiTabName !== 'scan'">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].resultList.join('\n') }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane name="curl">
                  <span slot="label"><i class="el-icon-circle-plus-outline"></i> cURL代码</span>
                  <highlight-code lang="bash">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['curl'] }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane name="nodejs">
                  <span slot="label"><i class="el-icon-circle-plus-outline"></i> NodeJS代码</span>
                  <highlight-code lang="js">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['nodejs'] }}
                  </highlight-code>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'apiLogListMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-connection"></i> 接口日志</span>
                  <el-row>
                    <vxe-toolbar>
                      <template v-slot:buttons>
                        <span>日志条数: <span style="font-weight: bold; color: #409eff">{{ getComputedApiLogDisplayResultList().length }} </span></span>
                        <vxe-input v-model="cache.apiLogDisplayFilterContent" type="search" placeholder="搜索" size="small"></vxe-input>
                        <vxe-button @click="apiLogDisplayResultExport" status="primary" size="small">导出</vxe-button>
                        <vxe-button @click="apiLogDisplayResultClear" status="danger" size="small">清空</vxe-button>
                      </template>
                    </vxe-toolbar>
                    <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                    <vxe-grid 
                      border="none"
                      stripe
                      height="560px"
                      highlight-hover-row
                      :header-row-style="{'background-color': '#f4f5f6'}"
                      ref="refApiLogDisplayResultGrid"
                      :sort-config="{trigger: 'cell'}"
                      :data="getComputedApiLogDisplayResultList()">
                      <vxe-table-column field="timeStr" title="时间" type="html" width="25%" sortable></vxe-table-column>
                      <vxe-table-column field="apiName" title="接口名称" type="html" width="15%" sortable></vxe-table-column>
                      <vxe-table-column field="apiContentJson" title="请求内容" type="html" width="60%" sortable></vxe-table-column>
                      <!-- TODO: 增加重放功能 -->
                    </vxe-grid>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'apiDemoMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-connection"></i> [单设备]建连->写入->通知</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>1.连接设备</span>
                      <el-button @click="apiDemoConnectTest" style="float: right; padding: 3px 0" type="text">测试</el-button>
                    </div>
                    <el-form label-width="80px" size="small">
                      <el-form-item label="历史接口">
                        <el-select @change="apiDemoConnectChanged" v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.tempFromApiLogUrl" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: '连接设备'})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="使用芯片">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.chip" size="small">
                          <el-radio-button label="0">芯片0</el-radio-button>
                          <el-radio-button label="1">芯片1</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="地址类型">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.addrType" size="small">
                          <el-radio-button label="public">PUBLIC</el-radio-button>
                          <el-radio-button label="random">RANDOM</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="设备地址">
                        <el-input v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.deviceMac"></el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>2.写入指令</span>
                      <el-button @click="apiDemoWriteTest" style="float: right; padding: 3px 0" type="text">测试</el-button>
                    </div>
                    <el-form label-width="80px" size="small">
                      <el-form-item label="历史接口">
                        <el-select @change="apiDemoWriteChanged" v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.tempFromApiLogUrl" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: '写入数据'})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="HANDLE">
                        <el-input v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.handle"></el-input>
                      </el-form-item>
                      <el-form-item label="VALUE">
                        <el-input v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.value"></el-input>
                      </el-form-item>
                      <el-form-item label="写入方式">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.noresponse" size="small">
                          <el-radio-button label="false">等待</el-radio-button>
                          <el-radio-button label="true">不等待</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>3.接收通知</span>
                    </div>
                    <el-form label-width="80px" size="small">
                      <span style="font-size: 12px">通过SSE接收数据</span>
                    </el-form>
                  </el-card>
                  <el-button-group style="margin-top: 15px;">
                    <el-button type="primary" size="small" @click="apiDemoConnectWriteNotifyGenCode">生成代码</el-button>
                    <el-button type="primary" size="small">清空数据</el-button>
                  </el-button-group>
                  <highlight-code lang="javascript">
                    {{ store.devConfDisplayVars.apiDemoParams.connectWriteNotify.code }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-connection"></i> [多设备]扫描->建连->写入</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>1.扫描设备</span>
                      <el-button @click="apiDemoScanTest" style="float: right; padding: 3px 0" type="text">测试</el-button>
                    </div>
                    <el-form label-width="80px" style="margin-top: 15px;" size="small">
                      <el-form-item label="历史接口">
                        <el-select @change="apiDemoScanChanged" v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.tempFromApiLogUrl" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: '扫描设备'})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="使用芯片">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.chip" size="small">
                          <el-radio-button :label="0">芯片0</el-radio-button>
                          <el-radio-button :label="1">芯片1</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="过滤名称">
                        <el-select v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_name" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                        </el-select>
                      </el-form-item>
                      <el-form-item label="过滤MAC">
                        <el-select v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_mac" placeholder="请输入" multiple filterable allow-create default-first-option style="width: 100%">
                        </el-select>
                      </el-form-item>
                      <el-form-item label="过滤RSSI">
                        <el-slider
                        v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_rssi"
                        show-input
                        :min="-85"
                        :max="0">
                      </el-slider>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>2.连接设备</span>
                    </div>
                    <el-form label-width="80px" size="small">
                      <span style="font-size: 12px">连接扫描到的设备</span>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>3.写入指令</span>
                    </div>
                    <el-form label-width="80px" size="small">
                      <el-form-item label="历史接口">
                        <el-select @change="apiDemoWriteChanged" v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.tempFromApiLogUrl" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: '写入数据'})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="HANDLE">
                        <el-input v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.handle"></el-input>
                      </el-form-item>
                      <el-form-item label="VALUE">
                        <el-input v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.value"></el-input>
                      </el-form-item>
                      <el-form-item label="写入方式">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.noresponse" size="small">
                          <el-radio-button label="false">等待</el-radio-button>
                          <el-radio-button label="true">不等待</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-button-group style="margin-top: 15px;">
                    <el-button type="primary" size="small" @click="apiDemoScanConnectWriteNotifyGenCode">生成代码</el-button>
                    <el-button type="primary" size="small">清空数据</el-button>
                  </el-button-group>
                  <highlight-code lang="javascript">
                    {{ store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.code }}
                  </highlight-code>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'toolsMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-s-tools"></i> 常用工具</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>进制转换</span>
                    </div>
                    <el-form :inline="true" size="small" style="width: 100%">
                      <el-form-item>
                        <el-radio-group v-model="store.devConfDisplayVars.toolsBinaryConversion.type">
                          <el-radio-button label="2"></el-radio-button>
                          <el-radio-button label="10"></el-radio-button>
                          <el-radio-button label="16"></el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item>
                        <el-input v-model="store.devConfDisplayVars.toolsBinaryConversion.value">
                        </el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                      <span>HEX/TEXT转换</span>
                    </div>
                    <el-form :inline="true" size="small" style="width: 100%">
                      <el-form-item>
                        <el-radio-group v-model="store.devConfDisplayVars.toolsHexTextConversion.type">
                          <el-radio-button label="hex"></el-radio-button>
                          <el-radio-button label="text"></el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item>
                        <el-input v-model="store.devConfDisplayVars.toolsHexTextConversion.value">
                        </el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                      <span>JSON格式化</span>
                    </div>
                    <el-form size="small" style="width: 100%">
                      <el-form-item>
                        <el-input v-model="store.devConfDisplayVars.toolsJsonConversion.inline">
                        </el-input>
                      </el-form-item>
                      <el-form-item>
                        <highlight-code lang="javascript">
                          {{ store.devConfDisplayVars.toolsJsonConversion.format }}
                        </highlight-code>
                      </el-form-item>
                    </el-form>
                  </el-card>
                </el-tab-pane>
              </el-tabs>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

import vueModule from './module/vue.js';
export default vueModule.createVue();

</script>

<style>
HTML {
}

HTML, BODY {
  margin: 0px;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

* {
  font-family: "Monaco", "monospace", "Courier New", "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}

.col1 {
  height: 100%;
  background-color: #fff;
  font-size: 14px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  /* margin-left: 10px; */
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  /* margin-left: 10px; */
  vertical-align: bottom;
}

/* 取消显示侧边菜单的右侧边框 */
.el-menu-vertical-demo {
  /* border-left: 1px solid #e6e6e6; */
  border-right: 0px;
  width: 100%;
  height: 100%;
  text-align: center;
}

input::-webkit-input-placeholder {
  /* font-style: italic; */
}

div::-webkit-scrollbar {
  width: 0;
}

pre::-webkit-scrollbar {
  width: 0;
}

code {
  overflow-y: scroll;
}

.hljs {
  font-size: 12px;
  padding: 15px;
}

/* 当页面加载完再显示 */
[v-cloak]{
  display: none;
}

.el-menu-item.is-active {
  background-color: #22315f !important;
}

.el-radio-button__inner {
  width: 80px;
}
</style>
