<?php

namespace Justoverclock\UsersMapLocation\Listeners;

use Flarum\User\Event\Saving;
use Illuminate\Support\Arr;

class SaveLocationToDatabase
{
    public function handle(Saving $event)
    {
        $user = $event->user;
        $data = $event->data;
        $actor = $event->actor;

        $isSelf = $actor->id === $user->id;
        $canEdit = $actor->can('edit', $user);
        $attributes = Arr::get($data, 'attributes', []);

        if(array_key_exists('location_latitude', $attributes)) {
            if (!$isSelf) {
                $actor->assertPermission($canEdit);
            }
            if(!isset($attributes['location_latitude']) || !isset($attributes['location_longitude'])) {
                $user->location_city = null;
                $user->location_postcode = null;
                $user->location_countrycode = null;
                $user->location_country = null;
                $user->location_latitude = null;
                $user->location_longitude = null;
            } else {
                $user->location_city = $attributes['location_city'];
                $user->location_postcode = $attributes['location_postcode'];
                $user->location_countrycode = $attributes['location_countrycode'];
                $user->location_country = $attributes['location_country'];
                $user->location_latitude = $attributes['location_latitude'];
                $user->location_longitude = $attributes['location_longitude'];
            }
        }
    }
}
