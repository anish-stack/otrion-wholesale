package com.orionwholesale;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "orionwholesale";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
 protected ReactRootView createRootView() {
  ReactRootView reactRootView = new ReactRootView(getContext());
  reactRootView.setIsFabric(false); // ✅ Disable Fabric explicitly
  return reactRootView;
}

@Override
protected boolean isConcurrentRootEnabled() {
  return false; // ✅ Disable React 18 Concurrent Mode explicitly
}
  }
}
