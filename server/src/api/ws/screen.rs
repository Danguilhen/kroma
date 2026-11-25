use serde::Deserialize;

use super::message::ClientMessage;
use super::Viewer;
use crate::services::screens::{Origin, Screen, ScreenDevice, ScreenReply};
use crate::state::SharedState;

pub(super) const MAX_CLIENT_TEXT: usize = 1 << 20;

#[derive(Deserialize)]
#[serde(tag = "type")]
enum ScreenMessage {
    #[serde(rename = "screen.hello")]
    Hello {
        #[serde(rename = "screenId")]
        screen_id: String,
        #[serde(default)]
        name: String,
        #[serde(default)]
        platform: String,
    },
    #[serde(rename = "screen.reply")]
    Reply {
        #[serde(rename = "requestId")]
        request_id: String,
        screen: Screen,
    },
}

pub(super) struct ScreenSeat {
    state: SharedState,
    connection: u64,
}

impl ScreenSeat {
    pub(super) fn open(state: &SharedState) -> Self {
        Self {
            state: state.clone(),
            connection: state.screens.connection(),
        }
    }

    pub(super) fn read(&self, who: &Viewer, text: &str) -> Option<ClientMessage> {
        if text.len() > MAX_CLIENT_TEXT {
            return None;
        }
        if let Ok(message) = serde_json::from_str::<ScreenMessage>(text) {
            self.handle(who, message);
            return None;
        }
        serde_json::from_str(text).ok()
    }

    fn handle(&self, who: &Viewer, message: ScreenMessage) {
        let from = Origin {
            user_id: &who.id,
            connection: self.connection,
        };
        let screens = &self.state.screens;
        match message {
            ScreenMessage::Hello {
                screen_id,
                name,
                platform,
            } => {
                let device = ScreenDevice {
                    id: screen_id,
                    name,
                    platform,
                };
                screens.hello(from, device);
            }
            ScreenMessage::Reply { request_id, screen } => {
                screens.answer(from, ScreenReply { request_id, screen });
            }
        }
    }
}

impl Drop for ScreenSeat {
    fn drop(&mut self) {
        self.state.screens.forget(self.connection);
    }
}
