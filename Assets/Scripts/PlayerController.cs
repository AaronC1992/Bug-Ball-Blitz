using UnityEngine;

public class PlayerController : MonoBehaviour {
    public float speed = 5f;

    void Update() {
        HandleTouchControls();
    }

    void HandleTouchControls() {
        if (Input.touchCount > 0) {
            Touch touch = Input.GetTouch(0);
            Vector3 touchPosition = Camera.main.ScreenToWorldPoint(touch.position);
            touchPosition.z = 0;
            transform.position = Vector3.MoveTowards(transform.position, touchPosition, speed * Time.deltaTime);
        }
    }
}
