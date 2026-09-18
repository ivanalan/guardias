import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

// Side-effect import: initializes i18next before App mounts
import './src/i18n';

import App from './App';
import { widgetTaskHandler } from './src/features/widget-android/widget-task-handler';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
