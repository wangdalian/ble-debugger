import Vue from 'vue'
import { 
  Row,
  Col,
  Button,
  Form,
  FormItem,
  Divider,
  Input,
  RadioGroup,
  RadioButton,
  Slider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Link,
  Menu,
  MenuItem,
  Tabs,
  TabPane,
  Option,
  ButtonGroup,
  Select,
  InfiniteScroll,
  Notification,
  Collapse,
  CollapseItem,
  Popover,
  Table,
  TableColumn,
  MessageBox,
  Tag
} from 'element-ui'

Vue.use(InfiniteScroll)
Vue.use(Select)
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Divider)
Vue.use(Input)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Slider)
Vue.use(Dropdown)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Link)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Option)
Vue.use(ButtonGroup)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Popover)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tag)
Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;
